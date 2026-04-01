// components/visuals/ShapeDisplay.tsx
interface ShapeDisplayProps {
  shape: "circle" | "square" | "rectangle" | "triangle" | "pentagon" | "hexagon"
  label?: string
  sides?: boolean
  color?: string
  width?: number
  height?: number
}

const SHAPE_COLORS: Record<string, string> = {
  circle: "#4A90D9",
  square: "#E67E22",
  rectangle: "#27AE60",
  triangle: "#9B59B6",
  pentagon: "#E74C3C",
  hexagon: "#F39C12",
}

const SHAPE_SIDES: Record<string, number> = {
  circle: 0,
  square: 4,
  rectangle: 4,
  triangle: 3,
  pentagon: 5,
  hexagon: 6,
}

function polygonPoints(n: number, cx: number, cy: number, r: number, offsetAngle = 0): string {
  const pts = []
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n + offsetAngle
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(" ")
}

export default function ShapeDisplay({ shape, label, sides, color, width, height }: ShapeDisplayProps) {
  const fill = color || SHAPE_COLORS[shape] || "#4A90D9"
  const stroke = fill
  const sideCount = SHAPE_SIDES[shape]
  const shapeName = label || shape.charAt(0).toUpperCase() + shape.slice(1)

  const size = 240
  const cx = size / 2
  const cy = size / 2
  const r = 90

  let shapeEl: React.ReactNode

  if (shape === "circle") {
    shapeEl = <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={3} opacity={0.85} />
  } else if (shape === "square") {
    shapeEl = (
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={fill} stroke={stroke} strokeWidth={3} opacity={0.85} />
    )
  } else if (shape === "rectangle") {
    const rw = width && height ? (r * 2 * width) / Math.max(width, height) : r * 2
    const rh = width && height ? (r * 2 * height) / Math.max(width, height) : r * 1.2
    shapeEl = (
      <rect x={cx - rw / 2} y={cy - rh / 2} width={rw} height={rh} fill={fill} stroke={stroke} strokeWidth={3} opacity={0.85} />
    )
  } else if (shape === "triangle") {
    shapeEl = (
      <polygon
        points={polygonPoints(3, cx, cy, r, -Math.PI / 2)}
        fill={fill}
        stroke={stroke}
        strokeWidth={3}
        opacity={0.85}
      />
    )
  } else if (shape === "pentagon") {
    shapeEl = (
      <polygon
        points={polygonPoints(5, cx, cy, r, -Math.PI / 2)}
        fill={fill}
        stroke={stroke}
        strokeWidth={3}
        opacity={0.85}
      />
    )
  } else if (shape === "hexagon") {
    shapeEl = (
      <polygon
        points={polygonPoints(6, cx, cy, r, 0)}
        fill={fill}
        stroke={stroke}
        strokeWidth={3}
        opacity={0.85}
      />
    )
  }

  const sidesLabel =
    sides && sideCount > 0 ? `${sideCount} sides` : sides && sideCount === 0 ? "0 sides (curved)" : null

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 0" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {shapeEl}
      </svg>
      <div style={{ fontSize: 18, fontWeight: 700, color: fill }}>{shapeName}</div>
      {sidesLabel && (
        <div style={{ fontSize: 15, color: "#555" }}>{sidesLabel}</div>
      )}
    </div>
  )
}
