import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

afterEach(() => {
  cleanup()
})

// Mock next/navigation (App Router)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'mock-cookie' }),
    getAll: () => [],
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))

// Mock next/image
vi.mock('next/image', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: mock implementation
  default: (props: any) => {
    const { fill, priority, ...rest } = props
    // biome-ignore lint/performance/noImgElement: mock implementation
    return <img alt="" {...rest} />
  },
}))

// PointerEvent mock (required for shadcn/ui Select, Dialog, Dropdown)
class MockPointerEvent extends Event {
  button: number
  ctrlKey: boolean
  pointerType: string
  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props)
    this.button = props.button || 0
    this.ctrlKey = props.ctrlKey || false
    this.pointerType = props.pointerType || 'mouse'
  }
}
// biome-ignore lint/suspicious/noExplicitAny: mock implementation
window.PointerEvent = MockPointerEvent as any
window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()
