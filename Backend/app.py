from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import AppConfig, UPLOADS_DIR
from services.comparison_engine import compare_kpis
from services.global_pipeline import run_global_pipeline
from services.local_pipeline import get_local_results, process_local_upload
from services.suggestion_engine import generate_suggestions
from utils.helpers import safe_jsonify


_ALLOWED_UPLOAD_EXTENSIONS = {"csv"}


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in _ALLOWED_UPLOAD_EXTENSIONS


def create_app() -> Flask:
    cfg = AppConfig()

    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024
    app.config["UPLOAD_FOLDER"] = str(UPLOADS_DIR)

    CORS(app, resources={r"/api/*": {"origins": list(cfg.cors_origins)}})

    Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)

    if not app.debug and not app.testing:
        import logging
        from logging.handlers import RotatingFileHandler
        
        handler = RotatingFileHandler('ecommerce_backend.log', maxBytes=100000, backupCount=3)
        handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        handler.setLevel(logging.INFO)
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Backend startup')

    @app.get("/api/health")
    def health() -> tuple[dict[str, str], int]:
        return {"status": "ok"}, 200

    @app.get("/api/global")
    def api_global():
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        category = request.args.get("category")
        state = request.args.get("state")

        result = run_global_pipeline(
            start_date=start_date, end_date=end_date, category=category, state=state
        )
        return jsonify(safe_jsonify(result))

    @app.post("/api/upload")
    def api_upload():
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if not file or not file.filename:
            return jsonify({"error": "Empty file"}), 400

        if not _allowed_file(file.filename):
            return jsonify({"error": "Only CSV files are supported"}), 400

        filename = secure_filename(file.filename)
        destination = Path(app.config["UPLOAD_FOLDER"]) / filename
        file.save(destination)

        local_data = process_local_upload(destination)
        return jsonify({"message": "Upload processed", "local": safe_jsonify(local_data)})

    @app.get("/api/local")
    def api_local():
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        category = request.args.get("category")
        state = request.args.get("state")

        local = get_local_results(
            start_date=start_date, end_date=end_date, category=category, state=state
        )
        if not local:
            return jsonify({"error": "No local upload processed yet"}), 404
        return jsonify(safe_jsonify(local))

    @app.get("/api/compare")
    def api_compare():
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        category = request.args.get("category")
        state = request.args.get("state")

        global_data = run_global_pipeline(
            start_date=start_date, end_date=end_date, category=category, state=state
        )
        local_data = get_local_results(
            start_date=start_date, end_date=end_date, category=category, state=state
        )
        if not local_data:
            return jsonify({"error": "No local upload available for comparison"}), 404

        comparison = compare_kpis(global_data.get("kpis", {}), local_data.get("kpis", {}))
        return jsonify(safe_jsonify({"comparison": comparison}))

    @app.get("/api/advanced")
    def api_advanced():
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        category = request.args.get("category")
        state = request.args.get("state")

        global_data = run_global_pipeline(
            start_date=start_date, end_date=end_date, category=category, state=state
        )
        payload = {
            "segmentation": global_data.get("segmentation", {}),
            "basket_rules": global_data.get("basket_rules", []),
            "anomalies": global_data.get("anomalies", []),
            "forecast": global_data.get("forecast", {}),
            "discount_model": global_data.get("discount_model", {}),
        }
        return jsonify(safe_jsonify(payload))

    @app.get("/api/suggestions")
    def api_suggestions():
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        category = request.args.get("category")
        state = request.args.get("state")

        global_data = run_global_pipeline(
            start_date=start_date, end_date=end_date, category=category, state=state
        )
        local_data = get_local_results(
            start_date=start_date, end_date=end_date, category=category, state=state
        ) or {"kpis": {}}

        comparison = compare_kpis(global_data.get("kpis", {}), local_data.get("kpis", {}))
        suggestions = generate_suggestions(
            global_kpis=global_data.get("kpis", {}),
            local_kpis=local_data.get("kpis", {}),
            comparison=comparison,
            basket_rules=global_data.get("basket_rules", []),
            anomalies=global_data.get("anomalies", []),
            forecast=global_data.get("forecast", {}),
        )

        return jsonify(safe_jsonify({"suggestions": suggestions}))

    @app.errorhandler(Exception)
    def handle_exception(exc: Exception):
        return jsonify({"error": str(exc)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    cfg = AppConfig()
    app.run(host=cfg.host, port=cfg.port, debug=cfg.flask_debug, use_reloader=False)
