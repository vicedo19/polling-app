'use client'

import { useState } from 'react'
import { Poll } from '@/app/lib/polls/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type PollDetailProps = {
  poll: Poll
}

export function PollDetail({ poll }: PollDetailProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)
  
  const handleVote = () => {
    if (!selectedOption || !poll.isActive) return
    
    setIsSubmitting(true)
    
    // Simulate API call to submit vote
    setTimeout(() => {
      setHasVoted(true)
      setIsSubmitting(false)
    }, 500)
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
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
            
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
                      {option.votes} votes ({percentage}%)
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
        <CardFooter>
          <Button 
            onClick={handleVote} 
            disabled={!selectedOption || isSubmitting} 
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Vote'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}