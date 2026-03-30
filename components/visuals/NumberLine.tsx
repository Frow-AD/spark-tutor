// components/visuals/NumberLine.tsx
interface NumberLineProps {
  min: number
  max: number
  highlight: number
  marks?: number[]
}

export default function NumberLine({ min, max, highlight, marks = [] }: NumberLineProps) {
  const range = Math.max(1, max - min)
  const w = 320
  const pad = 24
  const lineY = 50
  const lineW = w - pad * 2

  const xFor = (v: number) => pad + ((v - min) / range) * lineW

  const ticks = Array.from({ length: range + 1 }, (_, i) => min + i)

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-2xl mt-2">
      <svg width={w} height={90} className="overflow-visible">
        {/* Line */}
        <line x1={pad - 4} y1={lineY} x2={w - pad + 8} y2={lineY} stroke="#60A5FA" strokeWidth={5} strokeLinecap="round" />
        {/* Arrow */}
        <polygon points={`${w - pad + 8},${lineY} ${w - pad},${lineY - 6} ${w - pad},${lineY + 6}`} fill="#60A5FA" />

        {/* Ticks */}
        {ticks.map(v => (
          <g key={v}>
            <line x1={xFor(v)} y1={lineY - 10} x2={xFor(v)} y2={lineY + 10} stroke="#93C5FD" strokeWidth={2} />
            <text x={xFor(v)} y={lineY + 26} textAnchor="middle" fontSize={13} fontWeight="600" fill="#3B82F6">{v}</text>
          </g>
        ))}

        {/* Extra marks */}
        {marks.filter(m => m >= min && m <= max && m !== highlight).map(m => (
          <circle key={m} cx={xFor(m)} cy={lineY} r={7} fill="#FCD34D" stroke="#F59E0B" strokeWidth={2} />
        ))}

        {/* Highlight */}
        {highlight >= min && highlight <= max && (
          <g>
            <circle cx={xFor(highlight)} cy={lineY} r={13} fill="#EF4444" stroke="#B91C1C" strokeWidth={3} />
            <text x={xFor(highlight)} y={lineY + 5} textAnchor="middle" fontSize={12} fontWeight="800" fill="white">{highlight}</text>
          </g>
        )}
      </svg>
      <p className="text-sm font-semibold text-blue-500">{highlight} is here! 👆</p>
    </div>
  )
}
