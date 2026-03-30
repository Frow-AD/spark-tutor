// components/visuals/BarGraph.tsx
interface BarGraphProps {
  labels: string[]
  values: number[]
  title?: string
}

export default function BarGraph({ labels, values, title }: BarGraphProps) {
  const bars = labels.slice(0, 6).map((l, i) => ({ label: l, value: values[i] ?? 0 }))
  const maxVal = Math.max(...bars.map(b => b.value), 1)
  const colors = ["#60A5FA","#34D399","#F87171","#FCD34D","#A78BFA","#FB923C"]
  const chartH = 140
  const barW = 40
  const gap = 16
  const padX = 12
  const totalW = bars.length * (barW + gap) - gap + padX * 2

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-2xl mt-2">
      {title && <p className="text-base font-bold text-blue-700">{title}</p>}
      <svg width={totalW} height={chartH + 40} className="overflow-visible">
        {/* Bars */}
        {bars.map((b, i) => {
          const bh = Math.max(4, (b.value / maxVal) * chartH)
          const x = padX + i * (barW + gap)
          const y = chartH - bh
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} rx={8} ry={8} fill={colors[i % colors.length]} />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={13} fontWeight="700" fill={colors[i % colors.length]}>{b.value}</text>
              <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={11} fontWeight="600" fill="#6B7280">{b.label}</text>
            </g>
          )
        })}
        {/* Baseline */}
        <line x1={padX - 4} y1={chartH} x2={totalW - padX + 4} y2={chartH} stroke="#D1D5DB" strokeWidth={2} />
      </svg>
    </div>
  )
}
