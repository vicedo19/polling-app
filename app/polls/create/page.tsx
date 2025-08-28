import { CreatePollForm } from '@/app/components/polls/create-poll-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreatePollPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center">
        <Link href="/polls">
          <Button variant="ghost" className="mr-4">
            ← Back to Polls
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create Poll</h1>
      </div>
      
      <CreatePollForm />
    </div>
  )
}