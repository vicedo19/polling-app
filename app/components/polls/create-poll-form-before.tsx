'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createPoll } from '@/lib/polls/supabase'
import { useAuth } from '@/lib/auth/auth-context'

type PollOption = {
  id: string
  text: string
}

export function CreatePollForm() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ])
  const [expiryDate, setExpiryDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleAddOption = () => {
    setOptions([...options, { id: `${options.length + 1}`, text: '' }])
  }

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return // Minimum 2 options required
    setOptions(options.filter(option => option.id !== id))
  }

  const handleOptionChange = (id: string, value: string) => {
    setOptions(
      options.map(option => 
        option.id === id ? { ...option, text: value } : option
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate form
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }
    if (options.some(option => !option.text.trim())) {
      setError('Please fill in all options')
      return
    }
    if (!user) {
      setError('You must be logged in to create a poll')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await createPoll({
        question: question.trim(),
        options: options.map(option => option.text.trim()),
        expiresAt: expiryDate || undefined
      })
      
      if (result.success) {
        router.push('/polls?created=1')
      } else {
        setError(result.error || 'Failed to create poll')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
        <CardDescription>Ask a question and provide options for people to vote on</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="What would you like to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="min-h-20"
            />
          </div>
          
          <div className="space-y-4">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={option.id} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  required
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddOption}
              className="w-full mt-2"
            >
              + Add Option
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
