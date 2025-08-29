'use client'

import { useState, useEffect } from 'react'
import { PollDetail } from '@/app/components/polls/poll-detail'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPollById } from '@/lib/polls/supabase'
import { Poll } from '@/app/lib/polls/types'

type PollDetailPageProps = {
  params: {
    id: string
  }
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPoll() {
      try {
        const result = await getPollById(params.id)
        if (result.success && result.poll) {
          setPoll(result.poll)
        } else {
          setError(result.error || 'Poll not found')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPoll()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center">
          <Link href="/polls">
            <Button variant="ghost" className="mr-4 text-blue-600">
              ← Back to Polls
            </Button>
          </Link>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading poll...</div>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center">
          <Link href="/polls">
            <Button variant="ghost" className="mr-4 text-blue-600">
              ← Back to Polls
            </Button>
          </Link>
        </div>
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error || 'Poll not found'}
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/polls">
            <Button variant="ghost" className="mr-4 text-blue-600">
              ← Back to Polls
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Poll</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>
      
      <PollDetail poll={poll} onVoteUpdate={() => {
        // Refresh poll data after voting
        getPollById(params.id).then(result => {
          if (result.success && result.poll) {
            setPoll(result.poll)
          }
        })
      }} />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(window.location.href)}>Copy Link</Button>
          <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(poll.question)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}>Share on Twitter</Button>
        </div>
      </div>
    </div>
  )
}