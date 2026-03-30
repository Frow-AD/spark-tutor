// components/visuals/TenFrame.tsx
interface TenFrameProps {
  count: number
}

function SingleFrame({ filled, total = 10, label }: { filled: number; total?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-red-300 shadow-md">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full border-3 flex items-center justify-center"
            style={{
              background: i < filled ? "#EF4444" : "#FEF2F2",
              border: `3px solid ${i < filled ? "#B91C1C" : "#FECACA"}`,
            }}
          />
        ))}
      </div>
      {label && <p className="text-xs font-semibold text-red-500">{label}</p>}
    </div>
  )
}

export default function TenFrame({ count }: TenFrameProps) {
  const c = Math.max(0, Math.min(count, 20))
  const needsTwo = c > 10

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-red-50 rounded-2xl mt-2">
      <div className="flex flex-wrap justify-center gap-4">
        {needsTwo ? (
          <>
            <SingleFrame filled={10} label="10" />
            <SingleFrame filled={c - 10} label={String(c - 10)} />
          </>
        ) : (
          <SingleFrame filled={c} />
        )}
      </div>
      <p className="text-sm font-semibold text-red-500">Counting {c}! 🔴</p>
    </div>
  )
}
