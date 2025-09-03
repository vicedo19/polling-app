'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Poll } from '@/app/lib/polls/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type PollListProps = {
  polls: Poll[]
}

export function PollList({ polls }: PollListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest')

  const sortedPolls = [...polls].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      const totalVotesA = a.options.reduce((sum, option) => sum + option.votes, 0)
      const totalVotesB = b.options.reduce((sum, option) => sum + option.votes, 0)
      return totalVotesB - totalVotesA
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <Button
          variant={sortBy === 'newest' ? 'default' : 'outline'}
          onClick={() => setSortBy('newest')}
        >
          Newest
        </Button>
        <Button
          variant={sortBy === 'popular' ? 'default' : 'outline'}
          onClick={() => setSortBy('popular')}
        >
          Most Voted
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPolls.map((poll) => {
          const createdDate = new Date(poll.createdAt)
          const formattedDate = createdDate.toLocaleDateString()
          const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)
          
          return (
            <Link href={`/polls/${poll.id}`} key={poll.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-md">{poll.question}</h3>
                    <p className="text-sm text-muted-foreground">
                      {poll.options.length} options
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span>{totalVotes} total votes</span>
                      <span>Created on {formattedDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}