// components/visuals/VisualBlock.tsx
import FractionBar from "./FractionBar"
import NumberLine from "./NumberLine"
import DotArray from "./DotArray"
import TenFrame from "./TenFrame"
import BaseBlocks from "./BaseBlocks"
import PieChart from "./PieChart"
import CountingObjects from "./CountingObjects"
import BarGraph from "./BarGraph"

export type VisualData =
  | { type: "fraction_bar"; numerator: number; denominator: number }
  | { type: "number_line"; min: number; max: number; highlight: number; marks?: number[] }
  | { type: "dot_array"; rows: number; cols: number; highlight?: number }
  | { type: "ten_frame"; count: number }
  | { type: "base_blocks"; ones: number; tens: number; hundreds?: number }
  | { type: "pie_chart"; numerator: number; denominator: number }
  | { type: "counting_objects"; emoji: string; count: number; groups?: number }
  | { type: "bar_graph"; labels: string[]; values: number[]; title?: string }

interface VisualBlockProps {
  visual: VisualData
}

export default function VisualBlock({ visual }: VisualBlockProps) {
  switch (visual.type) {
    case "fraction_bar":
      return <FractionBar numerator={visual.numerator} denominator={visual.denominator} />
    case "number_line":
      return <NumberLine min={visual.min} max={visual.max} highlight={visual.highlight} marks={visual.marks} />
    case "dot_array":
      return <DotArray rows={visual.rows} cols={visual.cols} highlight={visual.highlight} />
    case "ten_frame":
      return <TenFrame count={visual.count} />
    case "base_blocks":
      return <BaseBlocks ones={visual.ones} tens={visual.tens} hundreds={visual.hundreds} />
    case "pie_chart":
      return <PieChart numerator={visual.numerator} denominator={visual.denominator} />
    case "counting_objects":
      return <CountingObjects emoji={visual.emoji} count={visual.count} groups={visual.groups} />
    case "bar_graph":
      return <BarGraph labels={visual.labels} values={visual.values} title={visual.title} />
    default:
      return null
  }
}
