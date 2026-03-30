// components/visuals/DotArray.tsx
interface DotArrayProps {
  rows: number
  cols: number
  highlight?: number
}

export default function DotArray({ rows, cols, highlight }: DotArrayProps) {
  const total = rows * cols
  const r = Math.max(1, Math.min(rows, 10))
  const c = Math.max(1, Math.min(cols, 10))

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-purple-50 rounded-2xl mt-2">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))` }}>
        {Array.from({ length: r * c }).map((_, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
            style={{
              background: highlight !== undefined && i < highlight ? "#A78BFA" : "#DDD6FE",
              border: `3px solid ${highlight !== undefined && i < highlight ? "#7C3AED" : "#C4B5FD"}`,
            }}
          />
        ))}
      </div>
      <p className="text-sm font-semibold text-purple-600">{r} rows × {c} cols = {total} total</p>
    </div>
  )
}
