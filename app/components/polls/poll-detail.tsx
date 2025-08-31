'use client'

import { useState, useEffect } from 'react'
import { Poll } from '@/app/lib/polls/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { voteOnPoll } from '@/lib/polls/supabase'
import { useAuth } from '@/lib/auth/auth-context'

type PollDetailProps = {
  poll: Poll
  onVoteUpdate?: () => void
}

export function PollDetail({ poll, onVoteUpdate }: PollDetailProps) {
  const { user } = useAuth()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Local votes state for optimistic UI updates
  const [votesByOption, setVotesByOption] = useState<Record<string, number>>(() =>
    poll.options.reduce((acc, option) => {
      acc[option.id] = option.votes
      return acc
    }, {} as Record<string, number>)
  )

  // Keep local votes in sync when poll data refreshes
  useEffect(() => {
    const next = poll.options.reduce((acc, option) => {
      acc[option.id] = option.votes
      return acc
    }, {} as Record<string, number>)
    setVotesByOption(next)
  }, [poll])
  
  const totalVotes = Object.values(votesByOption).reduce((sum, n) => sum + n, 0)
  
  const handleVote = async () => {
    if (!selectedOption || !poll.isActive || !user) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await voteOnPoll(poll.id, selectedOption)
      if (result.success) {
        // Optimistically update vote count for the selected option
        setVotesByOption(prev => ({
          ...prev,
          [selectedOption]: (prev[selectedOption] || 0) + 1,
        }))
        setHasVoted(true)
        onVoteUpdate?.()
      } else {
        setError(result.error || 'Failed to submit vote')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{poll.question}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poll.options.map((option) => {
            const optionVotes = votesByOption[option.id] || 0
            const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
            
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {!hasVoted && poll.isActive ? (
                    <input
                      type="radio"
                      id={option.id}
                      name="poll-option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                      className="h-4 w-4 text-primary"
                    />
                  ) : null}
                  <label 
                    htmlFor={option.id} 
                    className={`flex-1 ${hasVoted ? 'font-medium' : ''}`}
                  >
                    {option.text}
                  </label>
                  {hasVoted && (
                    <span className="text-sm font-medium">
                      {optionVotes} votes ({percentage}%)
                    </span>
                  )}
                </div>
                
                {hasVoted && (
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {poll.expiresAt && (
          <p className="mt-4 text-sm text-muted-foreground">
            {new Date(poll.expiresAt) > new Date() 
              ? `Expires on ${formatDate(poll.expiresAt)}` 
              : `Expired on ${formatDate(poll.expiresAt)}`
            }
          </p>
        )}
      </CardContent>
      
      {!hasVoted && poll.isActive && (
        <CardFooter className="flex flex-col gap-2">
          {error && (
            <div className="p-2 text-red-600 bg-red-50 border border-red-200 rounded text-sm">
              {error}
            </div>
          )}
          {!user ? (
            <div className="p-2 text-amber-600 bg-amber-50 border border-amber-200 rounded text-sm">
              Please sign in to vote on this poll.
            </div>
          ) : (
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption || isSubmitting || !user} 
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}