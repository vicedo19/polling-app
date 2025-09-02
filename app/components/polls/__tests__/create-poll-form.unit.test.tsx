import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as pollsApi from '@/lib/polls/supabase'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push })
}))

// Mock UI components to simple primitives for test stability
vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}))
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />
}))
vi.mock('@/components/ui/label', () => ({
  Label: (props: any) => <label {...props} />
}))
vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />
}))
vi.mock('@/components/ui/card', () => ({
  Card: (props: any) => <div {...props} />,
  CardHeader: (props: any) => <div {...props} />,
  CardContent: (props: any) => <div {...props} />,
  CardFooter: (props: any) => <div {...props} />,
  CardTitle: (props: any) => <div {...props} />,
  CardDescription: (props: any) => <div {...props} />,
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
    ;(pollsApi.createPoll as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, pollId: 'p1' })

    const { CreatePollForm } = await import('../create-poll-form')
    try {
      render(<CreatePollForm />)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('RENDER_ERROR happy', e)
      throw e
    }

    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: 'Best language?' } })

    const optionInputs = screen.getAllByPlaceholderText(/Option/i)
    fireEvent.change(optionInputs[0], { target: { value: 'TypeScript' } })
    fireEvent.change(optionInputs[1], { target: { value: 'Python' } })

    fireEvent.click(screen.getByRole('button', { name: /create poll/i }))

    await waitFor(() => {
      expect(pollsApi.createPoll).toHaveBeenCalledWith({
        question: 'Best language?',
        options: ['TypeScript', 'Python'],
        expiresAt: undefined
      })
      expect(push).toHaveBeenCalledWith('/polls?created=1')
    })
  })

  it('edge/failure: shows validation error when an option is empty', async () => {
    ;(pollsApi.createPoll as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, pollId: 'p1' })

    const { CreatePollForm } = await import('../create-poll-form')
    try {
      render(<CreatePollForm />)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('RENDER_ERROR edge', e)
      throw e
    }

    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: 'Pick one' } })
    const optionInputs = screen.getAllByPlaceholderText(/Option/i)
    fireEvent.change(optionInputs[0], { target: { value: 'A' } })

    fireEvent.click(screen.getByRole('button', { name: /create poll/i }))

    expect(await screen.findByText(/Please fill in all options/i)).toBeInTheDocument()
    expect(pollsApi.createPoll).not.toHaveBeenCalled()
  })
})