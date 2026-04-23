import { render, screen } from '@testing-library/react'
import { KpiCard } from '../components/kpi-card'
import { expect, test } from 'vitest'

test('KpiCard renders correctly with all props', () => {
  render(
    <KpiCard 
      label="Total Revenue" 
      value="$1.2M" 
      detail="Combined revenue across global datasets"
      tone="positive"
    />
  )
  
  // Verify main elements are present
  expect(screen.getByText('Total Revenue')).toBeDefined()
  expect(screen.getByText('$1.2M')).toBeDefined()
  expect(screen.getByText('Combined revenue across global datasets')).toBeDefined()
})

test('KpiCard renders with negative tone', () => {
  render(
    <KpiCard 
      label="Discount Uplift" 
      value="-2.5%" 
      detail="Negative uplift from discounts"
      tone="negative"
    />
  )
  
  // Verify label and value
  expect(screen.getByText('Discount Uplift')).toBeDefined()
  expect(screen.getByText('-2.5%')).toBeDefined()
})
