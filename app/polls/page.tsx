'use client'

import { useState, useEffect } from 'react'
import { PollList } from '@/app/components/polls/poll-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getPolls } from '@/lib/polls/supabase'
import { Poll } from '@/app/lib/polls/types'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  // Handle success toast based on query param
  useEffect(() => {
    if (searchParams.get('created') === '1') {
      setToastMessage('Poll created successfully')
      setShowToast(true)
      // Clean the URL (remove query param)
      router.replace('/polls')
    }
  }, [searchParams, router])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    async function fetchPolls() {
      try {
        const result = await getPolls()
        if (result.success && result.polls) {
          setPolls(result.polls)
        } else {
          setError(result.error || 'Failed to fetch polls')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()
  }, [])

  const Toast = () => (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow">
        <span className="font-medium">{toastMessage}</span>
        <button
          type="button"
          aria-label="Close notification"
          className="ml-2 text-green-700/70 hover:text-green-800"
          onClick={() => setShowToast(false)}
        >
          ×
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="container py-4 space-y-6">
        {showToast && <Toast />}
        <div className="flex justify-between items-center pb-2">
          <h1 className="text-2xl font-bold">Polls</h1>
          <Link href="/polls/create">
            <Button className="rounded-md">Create New Poll</Button>
          </Link>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading polls...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-4 space-y-6">
        {showToast && <Toast />}
        <div className="flex justify-between items-center pb-2">
          <h1 className="text-2xl font-bold">Polls</h1>
          <Link href="/polls/create">
            <Button className="rounded-md">Create New Poll</Button>
          </Link>
        </div>
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 space-y-6">
      {showToast && <Toast />}
      <div className="flex justify-between items-center pb-2">
        <h1 className="text-2xl font-bold">Polls</h1>
        <Link href="/polls/create">
          <Button className="rounded-md">Create New Poll</Button>
        </Link>
      </div>
      
      {polls.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No polls found. Create your first poll!</p>
          <Link href="/polls/create">
            <Button>Create Poll</Button>
          </Link>
        </div>
      ) : (
        <PollList polls={polls} />
      )}
    </div>
  )
}