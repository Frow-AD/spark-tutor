// components/visuals/BaseBlocks.tsx
interface BaseBlocksProps {
  ones: number
  tens: number
  hundreds?: number
}

export default function BaseBlocks({ ones, tens, hundreds = 0 }: BaseBlocksProps) {
  const o = Math.min(ones, 9)
  const t = Math.min(tens, 9)
  const h = Math.min(hundreds, 9)

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-green-50 rounded-2xl mt-2">
      <div className="flex gap-6 items-end justify-center flex-wrap">
        {/* Hundreds - big squares */}
        {h > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex flex-wrap gap-1 max-w-[120px]">
              {Array.from({ length: h }).map((_, i) => (
                <div key={i} className="rounded-lg shadow" style={{ width: 36, height: 36, background: "#6EE7B7", border: "3px solid #10B981" }}>
                  <svg width={36} height={36}>
                    {Array.from({ length: 10 }).map((_, r) => (
                      <line key={r} x1={0} y1={r * 3.6} x2={36} y2={r * 3.6} stroke="#34D399" strokeWidth={0.5} />
                    ))}
                    {Array.from({ length: 10 }).map((_, c) => (
                      <line key={c} x1={c * 3.6} y1={0} x2={c * 3.6} y2={36} stroke="#34D399" strokeWidth={0.5} />
                    ))}
                  </svg>
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-green-700">{h} hundred{h !== 1 ? "s" : ""}</p>
          </div>
        )}

        {/* Tens - tall bars */}
        {t > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1 items-end">
              {Array.from({ length: t }).map((_, i) => (
                <div key={i} className="rounded-md shadow flex flex-col" style={{ width: 14, height: 70, background: "#93C5FD", border: "3px solid #3B82F6" }}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div key={j} style={{ flex: 1, borderBottom: j < 9 ? "1px solid #60A5FA" : "none" }} />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-blue-700">{t} ten{t !== 1 ? "s" : ""}</p>
          </div>
        )}

        {/* Ones - small cubes */}
        {o > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex flex-wrap gap-1 max-w-[80px]">
              {Array.from({ length: o }).map((_, i) => (
                <div key={i} className="rounded shadow" style={{ width: 18, height: 18, background: "#FCD34D", border: "3px solid #F59E0B" }} />
              ))}
            </div>
            <p className="text-xs font-bold text-yellow-700">{o} one{o !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-green-700">
        {h > 0 ? `${h * 100} + ` : ""}{t > 0 ? `${t * 10} + ` : ""}{o} = {h * 100 + t * 10 + o}
      </p>
    </div>
  )
}
