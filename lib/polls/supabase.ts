import { createClient } from '@/lib/supabase/client'
import { Poll, PollOption } from '@/app/lib/polls/types'

export type CreatePollData = {
  question: string
  options: string[]
  expiresAt?: string
}

export type DatabasePoll = {
  id: string
  question: string
  created_by: string
  created_at: string
  expires_at?: string
  is_active: boolean
}

export type DatabasePollOption = {
  id: string
  poll_id: string
  option_text: string
  created_at: string
}

export type DatabaseVote = {
  id: string
  poll_id: string
  option_id: string
  user_id: string
  created_at: string
}

export async function createPoll(pollData: CreatePollData): Promise<{ success: boolean; pollId?: string; error?: string }> {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: pollData.question,
        created_by: user.id,
        expires_at: pollData.expiresAt || null,
        is_active: true
      })
      .select('id')
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return { success: false, error: 'Failed to create poll' }
    }

    // Create poll options
    const optionsToInsert = pollData.options.map(optionText => ({
      poll_id: poll.id,
      option_text: optionText
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      // Clean up the poll if options failed
      await supabase.from('polls').delete().eq('id', poll.id)
      return { success: false, error: 'Failed to create poll options' }
    }

    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error('Unexpected error creating poll:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPolls(): Promise<{ success: boolean; polls?: Poll[]; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: pollsData, error: pollsError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (pollsError) {
      console.error('Error fetching polls:', pollsError)
      return { success: false, error: 'Failed to fetch polls' }
    }

    // Collect all option IDs to fetch their vote counts in one query
    const allOptionIds: string[] = (pollsData as Array<DatabasePoll & { poll_options: DatabasePollOption[] }>)
      .flatMap((poll) => (poll.poll_options || []).map((opt) => opt.id))

    // Build vote counts map: option_id -> count
    let voteCounts: Record<string, number> = {}
    if (allOptionIds.length > 0) {
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('option_id')
        .in('option_id', allOptionIds)

      if (!votesError && votesData) {
        voteCounts = votesData.reduce((acc: Record<string, number>, v: { option_id: string }) => {
          acc[v.option_id] = (acc[v.option_id] || 0) + 1
          return acc
        }, {})
      } else if (votesError) {
        console.error('Error fetching votes for polls:', votesError)
        // We can proceed with zeroed counts if vote fetch fails
      }
    }

    const polls: Poll[] = (pollsData as Array<DatabasePoll & { poll_options: DatabasePollOption[] }>).map((poll) => ({
      id: poll.id,
      question: poll.question,
      options: (poll.poll_options || []).map((option) => ({
        id: option.id,
        text: option.option_text,
        votes: voteCounts[option.id] ?? 0,
      })),
      createdBy: poll.created_by || 'Unknown',
      createdAt: poll.created_at,
      expiresAt: poll.expires_at,
      isActive: poll.is_active,
    }))

    return { success: true, polls }
  } catch (error) {
    console.error('Unexpected error fetching polls:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPollById(pollId: string): Promise<{ success: boolean; poll?: Poll; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (*)
      `)
      .eq('id', pollId)
      .single()

    if (pollError) {
      console.error('Error fetching poll:', pollError)
      return { success: false, error: 'Poll not found' }
    }

    // Get vote counts for each option
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollId)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return { success: false, error: 'Failed to fetch vote data' }
    }

    // Count votes per option
    const voteCounts: Record<string, number> = {}
    votesData.forEach(vote => {
      voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1
    })

    const poll: Poll = {
      id: pollData.id,
      question: pollData.question,
      options: pollData.poll_options.map((option: DatabasePollOption) => ({
        id: option.id,
        text: option.option_text,
        votes: voteCounts[option.id] || 0
      })),
      createdBy: pollData.created_by || 'Unknown',
      createdAt: pollData.created_at,
      expiresAt: pollData.expires_at,
      isActive: pollData.is_active
    }

    return { success: true, poll }
  } catch (error) {
    console.error('Unexpected error fetching poll:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function voteOnPoll(pollId: string, optionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if user has already voted on this poll
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      return { success: false, error: 'You have already voted on this poll' }
    }

    // Cast the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id
      })

    if (voteError) {
      console.error('Error casting vote:', voteError)
      return { success: false, error: 'Failed to cast vote' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error casting vote:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}