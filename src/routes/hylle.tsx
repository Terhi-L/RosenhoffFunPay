import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, primaryButton } from '../components/Screen'

export const Route = createFileRoute('/hylle')({ component: ShelfPlaceholder })

function ShelfPlaceholder() {
  return (
    <Screen>
      <main className="flex flex-1 flex-col gap-3 px-6 pt-16">
        <h1 className="m-0 font-display text-[30px] leading-[1.08] text-plum">
          Hylla
        </h1>
        <p className="m-0 text-muted">Kommer i Henriks spor.</p>
      </main>
      <div className="px-4 pt-3 pb-8">
        <Link to="/hjul" className={primaryButton}>
          Til betaling
        </Link>
      </div>
    </Screen>
  )
}
