import { Component } from 'react'
import { AlertOctagon } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('LAX360 ERP crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-surface-subtle px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
            <AlertOctagon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink">Something went wrong</h1>
            <p className="mt-1 max-w-md text-sm text-ink-muted">
              An unexpected error occurred while rendering LAX360 Architecture ERP. Try reloading the page.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Reload application
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
