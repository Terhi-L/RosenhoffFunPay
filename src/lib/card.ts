const digitsOf = (value: string) => value.replace(/\D/g, '')

export function formatCardNumber(value: string) {
  return (
    digitsOf(value)
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(' ') ?? ''
  )
}

export function isValidCardNumber(value: string) {
  const digits = digitsOf(value)
  if (digits.length !== 16) return false
  const sum = digits
    .split('')
    .reverse()
    .reduce((total, char, index) => {
      const digit = Number(char)
      if (index % 2 === 0) return total + digit
      const doubled = digit * 2
      return total + (doubled > 9 ? doubled - 9 : doubled)
    }, 0)
  return sum % 10 === 0
}

export function formatExpiry(value: string) {
  const digits = digitsOf(value).slice(0, 4)
  return digits.length > 2
    ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
    : digits
}

export function expiryError(value: string, now = new Date()) {
  const digits = digitsOf(value)
  const month = Number(digits.slice(0, 2))
  if (digits.length !== 4 || month < 1 || month > 12) {
    return 'Skriv utløpsdato som MM/ÅÅ.'
  }
  const year = 2000 + Number(digits.slice(2))
  const expired =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1)
  return expired ? 'Kortet er utløpt.' : null
}
