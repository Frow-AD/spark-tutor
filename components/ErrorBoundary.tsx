"use client"

import React from "react"
import { useRouter } from "next/navigation"

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  State
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Spark] Unhandled error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-6">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
            <div className="text-6xl">😅</div>
            <h2 className="text-2xl font-bold text-gray-700">Oops! Something went wrong</h2>
            <p className="text-gray-500 text-sm">
              Don't worry, your progress is safe. Let's go back to the home screen.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                this.props.onReset()
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-2xl transition-colors"
            >
              Go Home 🏠
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <ErrorBoundaryClass onReset={() => router.push("/")}>
      {children}
    </ErrorBoundaryClass>
  )
}
