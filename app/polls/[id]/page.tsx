'use client'

import { PollDetail } from '@/app/components/polls/poll-detail'
import { getPollById } from '@/app/lib/polls/mock-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PollDetailPageProps = {
  params: {
    id: string
  }
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  // Use the id directly from params
  const poll = getPollById(params.id)
  
  if (!poll) {
    notFound()
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
      
      <PollDetail poll={poll} />
      
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