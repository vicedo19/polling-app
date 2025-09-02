import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPoll } from '../supabase'

let createClientFactory: any
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => createClientFactory(),
}))

describe('createPoll - Unit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path: inserts poll and options successfully', async () => {
    // Arrange mock Supabase client for success
    createClientFactory = () => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'polls') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'poll-1' }, error: null }),
          }
        }
        if (table === 'poll_options') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      }),
    })

    // Act
    const result = await createPoll({ question: 'Q', options: ['A', 'B'] })

    // Assert
    expect(result.success).toBe(true)
    expect(result.pollId).toBe('poll-1')
  })

  it('edge/failure: returns error when user not authenticated', async () => {
    // Arrange unauthenticated client
    createClientFactory = () => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
      from: vi.fn(),
    })

    const result = await createPoll({ question: 'Q', options: ['A', 'B'] })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/not authenticated/i)
  })
})