// components/visuals/PieChart.tsx
interface PieChartProps {
  numerator: number
  denominator: number
}

export default function PieChart({ numerator, denominator }: PieChartProps) {
  const d = Math.max(1, denominator)
  const n = Math.min(numerator, d)
  const cx = 80, cy = 80, r = 70
  const colors = ["#FCD34D","#60A5FA","#34D399","#F87171","#A78BFA","#FB923C","#F472B6","#4ADE80"]

  const slices = Array.from({ length: d }, (_, i) => {
    const startAngle = (i / d) * 2 * Math.PI - Math.PI / 2
    const endAngle = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const large = d === 1 ? 1 : 0
    return { x1, y1, x2, y2, large, filled: i < n }
  })

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-yellow-50 rounded-2xl mt-2">
      <svg width={160} height={160}>
        {slices.map((s, i) => (
          d === 1 ? (
            <circle key={i} cx={cx} cy={cy} r={r} fill={colors[i % colors.length]} stroke="white" strokeWidth={3} />
          ) : (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.large} 1 ${s.x2} ${s.y2} Z`}
              fill={s.filled ? colors[i % colors.length] : "#F3F4F6"}
              stroke="white"
              strokeWidth={3}
            />
          )
        ))}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={2} />
      </svg>
      <div className="flex items-center gap-2 text-2xl font-bold text-yellow-700">
        <div className="flex flex-col items-center leading-none">
          <span>{n}</span>
          <div className="w-6 border-t-4 border-yellow-600 my-0.5" />
          <span>{d}</span>
        </div>
        <span className="text-base font-normal text-yellow-500 ml-2">= {n} out of {d} slices</span>
      </div>
    </div>
  )
}
