import { CreatePollForm } from '@/app/components/polls/create-poll-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreatePollPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="max-w-2xl mx-auto text-blue-500">
        <Link href="/polls">
          <Button variant="ghost">
            ← Back to Polls
          </Button>
        </Link>
      </div>
      
      <CreatePollForm />
    </div>
  )
}