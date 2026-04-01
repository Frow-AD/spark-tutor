// components/visuals/AngleDiagram.tsx
interface AngleDiagramProps {
  degrees: number
  label?: string
}

function getAngleType(deg: number): { name: string; color: string } {
  if (deg === 90) return { name: "Right Angle", color: "#2980B9" }
  if (deg === 180) return { name: "Straight Angle", color: "#8E44AD" }
  if (deg < 90) return { name: "Acute Angle", color: "#27AE60" }
  if (deg < 180) return { name: "Obtuse Angle", color: "#E67E22" }
  return { name: "Reflex Angle", color: "#C0392B" }
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export default function AngleDiagram({ degrees, label }: AngleDiagramProps) {
  const size = 240
  // Place vertex near bottom-left
  const vx = 60
  const vy = 180
  const rayLen = 130
  const arcRadius = 45

  const { name, color } = getAngleType(degrees)

  // First ray goes right (0°), second ray goes up by `degrees`
  const angle1 = 0 // rightward
  const angle2 = degrees // in degrees, counter-clockwise from first ray

  const x1 = vx + rayLen * Math.cos(toRad(angle1))
  const y1 = vy - rayLen * Math.sin(toRad(angle1))

  const x2 = vx + rayLen * Math.cos(toRad(angle2))
  const y2 = vy - rayLen * Math.sin(toRad(angle2))

  // Arc path
  const ax1 = vx + arcRadius * Math.cos(toRad(angle1))
  const ay1 = vy - arcRadius * Math.sin(toRad(angle1))
  const ax2 = vx + arcRadius * Math.cos(toRad(angle2))
  const ay2 = vy - arcRadius * Math.sin(toRad(angle2))
  const largeArc = degrees > 180 ? 1 : 0

  // Label position (midpoint of arc)
  const midAngle = degrees / 2
  const labelDist = arcRadius + 22
  const lx = vx + labelDist * Math.cos(toRad(midAngle))
  const ly = vy - labelDist * Math.sin(toRad(midAngle))

  const isRight = degrees === 90

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 0" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* First ray */}
        <line x1={vx} y1={vy} x2={x1} y2={y1} stroke={color} strokeWidth={3} strokeLinecap="round" />
        {/* Second ray */}
        <line x1={vx} y1={vy} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round" />

        {isRight ? (
          // Square corner indicator
          <>
            <polyline
              points={`${vx + 20},${vy} ${vx + 20},${vy - 20} ${vx},${vy - 20}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
          </>
        ) : (
          // Arc
          <path
            d={`M ${ax1} ${ay1} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${ax2} ${ay2}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        )}

        {/* Vertex dot */}
        <circle cx={vx} cy={vy} r={4} fill={color} />

        {/* Degree label */}
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill={color}>
          {degrees}°
        </text>
      </svg>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{label || name}</div>
    </div>
  )
}
