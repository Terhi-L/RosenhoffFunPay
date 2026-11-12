/** Pear, orange slice, watermelon, cherries and blueberries (canvas: Main). Decorative. */
export function FruitIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 120"
      width="100%"
      height="104"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M40 30C52 30 54 48 60 60C72 82 62 112 40 112C18 112 8 82 20 60C26 48 28 30 40 30Z"
        fill="#F5C02B"
      />
      <path
        d="M40 31L43 17"
        stroke="#6B4A2B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse
        cx="50"
        cy="20"
        rx="8"
        ry="4"
        fill="#8DC63F"
        transform="rotate(-20 50 20)"
      />
      <circle cx="105" cy="80" r="36" fill="#F28C28" />
      <circle cx="105" cy="80" r="29" fill="#FFC66B" />
      <path
        d="M76 80H134M105 51V109M84.5 59.5L125.5 100.5M125.5 59.5L84.5 100.5"
        stroke="#F28C28"
        strokeWidth="3"
      />
      <path d="M144 62A46 46 0 0 0 236 62Z" fill="#1B5E20" />
      <path d="M150 62A40 40 0 0 0 230 62Z" fill="#E9F5D8" />
      <path d="M155 62A35 35 0 0 0 225 62Z" fill="#EF5D78" />
      <ellipse cx="174" cy="74" rx="2.5" ry="4" fill="#1B2B22" />
      <ellipse cx="190" cy="82" rx="2.5" ry="4" fill="#1B2B22" />
      <ellipse cx="206" cy="74" rx="2.5" ry="4" fill="#1B2B22" />
      <path
        d="M268 42Q260 62 256 86M268 42Q276 64 286 90"
        stroke="#4E7A2A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="276"
        cy="40"
        rx="9"
        ry="4"
        fill="#8DC63F"
        transform="rotate(15 276 40)"
      />
      <circle cx="255" cy="96" r="13" fill="#B3123A" />
      <circle cx="287" cy="100" r="13" fill="#B3123A" />
      <circle cx="321" cy="96" r="13" fill="#4B3F8F" />
      <circle cx="343" cy="106" r="11" fill="#5A4DA6" />
      <circle cx="336" cy="78" r="10" fill="#3F347A" />
    </svg>
  )
}
