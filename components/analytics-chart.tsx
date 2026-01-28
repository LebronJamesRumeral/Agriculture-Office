'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const data = [
  {
    name: 'Farmers',
    value: 59.6,
    count: 1250,
  },
  {
    name: 'Fisherfolks',
    value: 40.4,
    count: 847,
  },
]

const COLORS = [
  'hsl(142, 71%, 45%)', // Primary green
  'hsl(220, 90%, 56%)', // Blue
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `${value.toFixed(1)}%`}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
