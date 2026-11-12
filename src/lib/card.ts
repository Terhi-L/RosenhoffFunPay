const digitsOf = (value: string) => value.replace(/\D/g, '')

export function formatCardNumber(value: string) {
  return (
    digitsOf(value)
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(' ') ?? ''
  )
}

export function formatExpiry(value: string) {
  const digits = digitsOf(value).slice(0, 4)
  return digits.length > 2
    ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
    : digits
}
