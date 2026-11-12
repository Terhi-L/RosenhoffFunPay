const WINNING_SIZE = 12
const OTHER_SIZE = (360 - WINNING_SIZE) / 5

export const SEGMENTS = [
  {
    label: '−50 %',
    color: 'var(--color-orange)',
    text: 'var(--color-ink)',
    size: OTHER_SIZE,
  },
  {
    label: '−30 %',
    color: 'var(--color-leaf)',
    text: '#fff',
    size: OTHER_SIZE,
  },
  {
    label: '−20 %',
    color: 'var(--color-grape)',
    text: '#fff',
    size: OTHER_SIZE,
  },
  {
    label: '−10 %',
    color: 'var(--color-sky)',
    text: 'var(--color-ink)',
    size: OTHER_SIZE,
  },
  {
    label: '−5 %',
    color: 'var(--color-lime)',
    text: 'var(--color-ink)',
    size: OTHER_SIZE,
  },
  { label: '+15 %', color: '#d7192d', text: '#fff', size: WINNING_SIZE },
]

export const WINNING_INDEX = SEGMENTS.length - 1
export const SPIN_MS = 4000

const segmentStart = (index: number) =>
  SEGMENTS.slice(0, index).reduce((sum, segment) => sum + segment.size, 0)

export const segmentCentre = (index: number) =>
  segmentStart(index) + SEGMENTS[index].size / 2

export function landingRotation(index: number, jitter = 0, turns = 5) {
  return turns * 360 + (360 - segmentCentre(index)) + jitter
}

export function randomJitter() {
  const max = SEGMENTS[WINNING_INDEX].size / 2 - 2
  return (Math.random() * 2 - 1) * max
}

export const wheelBackground = `conic-gradient(${SEGMENTS.map(
  (segment, index) =>
    `${segment.color} ${segmentStart(index)}deg ${segmentStart(index) + segment.size}deg`,
).join(', ')})`
