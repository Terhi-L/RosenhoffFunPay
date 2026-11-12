const words = [
  { word: 'Vi', color: 'text-orange-deep' },
  { word: 'gjør', color: 'text-leaf' },
  { word: 'handelen', color: 'text-grape' },
  { word: 'gøy!', color: 'text-melon-deep' },
]

/** "Vi gjør handelen gøy!" with each word in a fruit colour. Size it with `className`. */
export function Slogan({ className = 'text-[28px]' }: { className?: string }) {
  return (
    <p className={`m-0 font-display leading-[1.1] ${className}`}>
      {words.map(({ word, color }, index) => (
        <span key={word}>
          {index > 0 && ' '}
          <span className={color}>{word}</span>
        </span>
      ))}
    </p>
  )
}
