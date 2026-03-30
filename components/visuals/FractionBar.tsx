// components/visuals/FractionBar.tsx
interface FractionBarProps {
  numerator: number
  denominator: number
}

export default function FractionBar({ numerator, denominator }: FractionBarProps) {
  const d = Math.max(1, denominator)
  const n = Math.min(numerator, d)
  const colors = ["#FCD34D","#60A5FA","#34D399","#F87171","#A78BFA","#FB923C","#F472B6","#4ADE80"]

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-orange-50 rounded-2xl mt-2">
      <div className="flex rounded-xl overflow-hidden border-4 border-orange-300 w-72 h-14 shadow-md">
        {Array.from({ length: d }).map((_, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center border-r-2 border-orange-200 last:border-r-0"
            style={{ background: i < n ? colors[i % colors.length] : "#FFF7ED" }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-3xl font-bold text-orange-600">
        <div className="flex flex-col items-center leading-none">
          <span>{n}</span>
          <div className="w-8 border-t-4 border-orange-600 my-0.5" />
          <span>{d}</span>
        </div>
        <span className="text-lg font-normal text-orange-400 ml-2">= {n} out of {d} parts</span>
      </div>
    </div>
  )
}
