import { createContext, useContext, useState } from 'react'

interface Registration {
  phone: string
  setPhone: (phone: string) => void
}

const RegistrationContext = createContext<Registration>({
  phone: '',
  setPhone: () => {},
})

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [phone, setPhone] = useState('')
  return (
    <RegistrationContext value={{ phone, setPhone }}>
      {children}
    </RegistrationContext>
  )
}

export function useRegistration() {
  return useContext(RegistrationContext)
}

export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 5), digits.slice(5, 8)]
    .filter(Boolean)
    .join(' ')
}
