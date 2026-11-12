import { SEGMENTS, segmentCentre, wheelBackground } from './segments'

export function Wheel({
  rotation,
  animate,
}: {
  rotation: number
  animate: boolean
}) {
  return (
    <div className="relative w-full max-w-[300px] flex-none pt-[18px]">
      <svg
        width="34"
        height="30"
        viewBox="0 0 34 30"
        aria-hidden="true"
        className="absolute top-0 left-1/2 z-10 -translate-x-1/2 text-ink"
      >
        <path
          d="M2 2h30L17 28z"
          fill="currentColor"
          stroke="#fff"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <div
        role="img"
        aria-label="Lykkehjul med seks felt"
        className={`relative aspect-square w-full rounded-full border-[6px] border-ink ${animate ? 'transition-transform duration-[4s] ease-[cubic-bezier(0.12,0.8,0.18,1)] motion-reduce:transition-none' : ''}`}
        style={{
          background: wheelBackground,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {SEGMENTS.map((segment, index) => (
          <span
            key={segment.label}
            className="absolute inset-0"
            style={{ transform: `rotate(${segmentCentre(index)}deg)` }}
          >
            <span
              className={`absolute left-1/2 -translate-1/2 font-display whitespace-nowrap ${segment.size < 30 ? 'top-[16%] -rotate-90 text-[11px]' : 'top-[18%] text-lg'}`}
              style={{ color: segment.text }}
            >
              {segment.label}
            </span>
          </span>
        ))}
        <span className="absolute top-1/2 left-1/2 size-11 -translate-1/2 rounded-full border-4 border-ink bg-white" />
      </div>
    </div>
  )
}
