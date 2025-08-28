'use client'

import { PollList } from '@/app/components/polls/poll-list'
import { mockPolls } from '@/app/lib/polls/mock-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PollsPage() {
  return (
    <div className="container py-4 space-y-6">
      <div className="flex justify-between items-center pb-2">
        <h1 className="text-2xl font-bold">My Polls</h1>
        <Link href="/polls/create">
          <Button className="rounded-md">Create New Poll</Button>
        </Link>
      </div>
      
      <PollList polls={mockPolls} />
    </div>
  )
}