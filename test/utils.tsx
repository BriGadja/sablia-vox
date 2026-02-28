import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'

// Add providers here as needed (QueryClientProvider, ThemeProvider, etc.)
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
