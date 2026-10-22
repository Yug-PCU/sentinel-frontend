import { CircleAlert, OctagonAlert, ShieldCheck, ShieldQuestionMark, TriangleAlert } from 'lucide-react'

// Colors and icons per risk level. Risk colors are reserved for risk and always
// appear next to a text label. Class names are written out in full so Tailwind
// can find them.
const TONES = {
  low: {
    icon: ShieldCheck,
    text: 'text-risk-low',
    stroke: 'stroke-risk-low',
    track: 'stroke-risk-low/20',
    surface: 'border-risk-low/40 bg-risk-low/10',
  },
  medium: {
    icon: CircleAlert,
    text: 'text-risk-medium',
    stroke: 'stroke-risk-medium',
    track: 'stroke-risk-medium/20',
    surface: 'border-risk-medium/40 bg-risk-medium/10',
  },
  high: {
    icon: TriangleAlert,
    text: 'text-risk-high',
    stroke: 'stroke-risk-high',
    track: 'stroke-risk-high/20',
    surface: 'border-risk-high/40 bg-risk-high/10',
  },
  critical: {
    icon: OctagonAlert,
    text: 'text-risk-critical',
    stroke: 'stroke-risk-critical',
    track: 'stroke-risk-critical/20',
    surface: 'border-risk-critical/50 bg-risk-critical/10',
  },
  unknown: {
    icon: ShieldQuestionMark,
    text: 'text-navy-300',
    stroke: 'stroke-navy-300',
    track: 'stroke-navy-300/20',
    surface: 'border-navy-300/40 bg-navy-300/10',
  },
}

export function getRiskTone(level) {
  return typeof level === 'string' && Object.hasOwn(TONES, level) ? TONES[level] : TONES.unknown
}
