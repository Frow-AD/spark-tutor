// components/visuals/CountingObjects.tsx
interface CountingObjectsProps {
  emoji: string
  count: number
  groups?: number
}

export default function CountingObjects({ emoji, count, groups }: CountingObjectsProps) {
  const c = Math.max(1, Math.min(count, 30))

  if (groups && groups > 1) {
    const perGroup = Math.ceil(c / groups)
    const groupArr = Array.from({ length: groups }, (_, g) => {
      const start = g * perGroup
      const end = Math.min(start + perGroup, c)
      return Array.from({ length: end - start }, (__, i) => start + i)
    }).filter(g => g.length > 0)

    const colors = ["#FEE2E2","#DBEAFE","#D1FAE5","#FEF3C7","#EDE9FE","#FCE7F3"]

    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-pink-50 rounded-2xl mt-2">
        <div className="flex flex-wrap gap-3 justify-center">
          {groupArr.map((grp, gi) => (
            <div
              key={gi}
              className="rounded-2xl border-4 p-2 flex flex-wrap gap-1 justify-center"
              style={{ borderColor: "#F9A8D4", background: colors[gi % colors.length], minWidth: 60, maxWidth: 120 }}
            >
              {grp.map((_, i) => (
                <span key={i} className="text-2xl leading-none">{emoji}</span>
              ))}
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold text-pink-600">{groups} groups of {perGroup} = {c} total!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-pink-50 rounded-2xl mt-2">
      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
        {Array.from({ length: c }).map((_, i) => (
          <span key={i} className="text-3xl leading-none">{emoji}</span>
        ))}
      </div>
      <p className="text-sm font-semibold text-pink-600">Count them: {c}!</p>
    </div>
  )
}
