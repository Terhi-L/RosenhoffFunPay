export interface Sms {
  code: string
  text: string
}

const appleFont =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"

function MessagesIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex size-[38px] flex-none items-center justify-center rounded-[9px] bg-linear-to-b from-[#6ef584] to-[#12bd2c]"
    >
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path
          fill="#fff"
          d="M12 4C7 4 3 7.2 3 11.2c0 2.3 1.3 4.3 3.4 5.6-.2 1.2-.8 2.3-1.6 3.2 1.7-.1 3.2-.7 4.4-1.6.9.2 1.8.3 2.8.3 5 0 9-3.2 9-7.2S17 4 12 4z"
        />
      </svg>
    </span>
  )
}

/**
 * Fake iPhone SMS banner that drops in from the top. Tapping it fills in the
 * code, like iOS one-time-code autofill.
 */
export function SmsNotification({
  sms,
  visible,
  onTap,
}: {
  sms: Sms | null
  visible: boolean
  onTap: () => void
}) {
  return (
    <>
      <div
        inert={!visible}
        className={`fixed inset-x-0 top-2 z-50 mx-auto w-[calc(100%-16px)] max-w-[414px] transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.2,1.2,0.35,1)] motion-reduce:transition-none ${
          visible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-[140%] opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={onTap}
          style={{ fontFamily: appleFont }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-[22px] border-0 bg-[#f4f4f6]/85 px-3.5 py-3 text-left text-black shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
        >
          <MessagesIcon />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[15px] font-semibold">
                Norway Americana
              </span>
              <span className="text-[13px] text-[#6e6e73]">nå</span>
            </span>
            <span className="block text-[15px] leading-[1.3]">{sms?.text}</span>
            <span className="sr-only">Trykk for å fylle inn koden.</span>
          </span>
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {visible && sms ? `Ny SMS fra Norway Americana: ${sms.text}` : ''}
      </p>
    </>
  )
}
