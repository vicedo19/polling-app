import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from '../create/page'
import * as pollsApi from '@/lib/polls/supabase'

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({ user: { id: 'user-1' } })
}))

vi.mock('@/lib/polls/supabase', () => ({
  createPoll: vi.fn()
}))

describe('Create Poll Page - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('end-to-end: fills form, submits, and navigates on success', async () => {
    ;(pollsApi.createPoll as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, pollId: 'p1' })
    const push = vi.fn()
    vi.mock('next/navigation', async (orig) => ({
      ...(await orig()),
      useRouter: () => ({ push })
    }))

    render(<Page />)

    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: 'Your favorite DB?' } })
    const optionInputs = screen.getAllByPlaceholderText(/Option/i)
    fireEvent.change(optionInputs[0], { target: { value: 'Postgres' } })
    fireEvent.change(optionInputs[1], { target: { value: 'MySQL' } })

    fireEvent.click(screen.getByRole('button', { name: /create poll/i }))

    await waitFor(() => {
      expect(pollsApi.createPoll).toHaveBeenCalled()
      expect(push).toHaveBeenCalledWith('/polls?created=1')
    })
  })
})