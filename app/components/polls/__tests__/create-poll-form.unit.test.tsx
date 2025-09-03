import { type ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import * as pollsApi from '@/lib/polls/supabase'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push })
}))

// Mock UI components to simple primitives for test stability
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: ComponentProps<'button'>) => <button {...props}>{children}</button>
}))
vi.mock('@/components/ui/input', () => ({
  Input: (props: ComponentProps<'input'>) => <input {...props} />
}))
vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: ComponentProps<'label'>) => <label {...props}>{children}</label>
}))
vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: ComponentProps<'textarea'>) => <textarea {...props} />
}))

type DivProps = ComponentProps<'div'> & { children?: ReactNode }

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>
}))

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({ user: { id: 'user-1' } })
}))

vi.mock('@/lib/polls/supabase', () => ({
  createPoll: vi.fn()
}))

describe('CreatePollForm - Unit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path: creates a poll and redirects to /polls?created=1', async () => {
    const mockCreatePoll = pollsApi.createPoll as vi.Mock
    mockCreatePoll.mockResolvedValue({ success: true, pollId: 'p1' })

    const { CreatePollForm } = await import('../create-poll-form')
    render(<CreatePollForm />)

    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: 'Best language?' } })

    const optionInputs = screen.getAllByPlaceholderText(/Option/i)
    fireEvent.change(optionInputs[0], { target: { value: 'TypeScript' } })
    fireEvent.change(optionInputs[1], { target: { value: 'Python' } })

    fireEvent.click(screen.getByRole('button', { name: /create poll/i }))

    await waitFor(() => {
      expect(mockCreatePoll).toHaveBeenCalledWith({
        question: 'Best language?',
        options: ['TypeScript', 'Python'],
        expiresAt: undefined
      })
      expect(push).toHaveBeenCalledWith('/polls?created=1')
    })
  })

  it('edge/failure: shows validation error when an option is empty', async () => {
    const mockCreatePoll = pollsApi.createPoll as vi.Mock
    mockCreatePoll.mockResolvedValue({ success: true, pollId: 'p1' })

    const { CreatePollForm } = await import('../create-poll-form')
    render(<CreatePollForm />)

    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: 'Pick one' } })
    const optionInputs = screen.getAllByPlaceholderText(/Option/i)
    fireEvent.change(optionInputs[0], { target: { value: 'A' } })

    fireEvent.click(screen.getByRole('button', { name: /create poll/i }))

    expect(await screen.findByText(/Please fill in all options/i)).toBeInTheDocument()
    expect(mockCreatePoll).not.toHaveBeenCalled()
  })
})