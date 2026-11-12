import { useEffect, useRef } from 'react'
import { CloseIcon } from './icons'

/**
 * Accessible bottom sheet built on the native modal <dialog>: dims the page,
 * makes everything behind it inert, moves focus in, closes on Esc and on a
 * tap on the backdrop, and returns focus to where it was.
 *
 * Give the sheet a heading with an id and pass that id as `labelledBy`.
 * Put `autoFocus` on the element that should get focus first (defaults to
 * the close button).
 */
export function BottomSheet({
  open,
  onClose,
  labelledBy,
  icon,
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy: string
  /** Optional decoration shown top-left, opposite the close button. */
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      element.showModal()
    } else if (!open && element.open) {
      element.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      // Fires for Esc, backdrop taps, the close button and `open` → false.
      onClose={() => {
        returnFocus.current?.focus()
        if (open) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close()
      }}
      className="fixed inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-0 bg-white p-0 font-sans text-ink backdrop:bg-ink/55"
    >
      <div className="flex flex-col gap-4 px-6 pt-3 pb-8">
        <span
          aria-hidden="true"
          className="mx-auto h-[5px] w-11 rounded-full bg-line-strong"
        />
        <div className="flex items-start justify-between gap-3">
          {icon ?? <span />}
          <button
            type="button"
            aria-label="Lukk"
            onClick={() => dialog.current?.close()}
            className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-fill text-ink"
          >
            <CloseIcon size={18} strokeWidth={2.4} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
