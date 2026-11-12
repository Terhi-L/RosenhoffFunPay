export const SEGMENTS = [
  { label: '−50 %', color: 'var(--color-orange)', text: 'var(--color-ink)' },
  { label: '−30 %', color: 'var(--color-leaf)', text: '#fff' },
  { label: '−20 %', color: 'var(--color-grape)', text: '#fff' },
  { label: '−10 %', color: 'var(--color-sky)', text: 'var(--color-ink)' },
  { label: '−5 %', color: 'var(--color-melon)', text: 'var(--color-ink)' },
  { label: '+15 %', color: 'var(--color-ink)', text: 'var(--color-sun)' },
]

export const SEGMENT_ANGLE = 360 / SEGMENTS.length
export const WINNING_INDEX = SEGMENTS.length - 1
export const SPIN_MS = 4000

export const segmentCentre = (index: number) =>
  index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2

export function landingRotation(index: number, jitter = 0, turns = 5) {
  return turns * 360 + (360 - segmentCentre(index)) + jitter
}

export function randomJitter(max = 20) {
  return (Math.random() * 2 - 1) * max
}

export const wheelBackground = `conic-gradient(${SEGMENTS.map(
  (segment, index) =>
    `${segment.color} ${index * SEGMENT_ANGLE}deg ${(index + 1) * SEGMENT_ANGLE}deg`,
).join(', ')})`
