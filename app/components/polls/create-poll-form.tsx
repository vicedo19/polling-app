'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createPoll } from '@/lib/polls/supabase'
import { useAuth } from '@/lib/auth/auth-context'

// Form validation schema
const formSchema = z.object({
  question: z.string().min(1, 'Please enter a question'),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, 'Option text is required')
    })
  ).min(2, 'At least 2 options are required'),
  expiryDate: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

export function CreatePollForm() {
  const router = useRouter()
  const { user } = useAuth()
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      options: [
        { id: '1', text: '' },
        { id: '2', text: '' },
      ],
      expiryDate: ''
    }
  })

  // Setup field array for dynamic options
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options'
  })

  const handleAddOption = () => {
    append({ id: `${fields.length + 1}`, text: '' })
  }

  const handleRemoveOption = (index: number) => {
    if (fields.length <= 2) return // Minimum 2 options required
    remove(index)
  }

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      form.setError('root', { message: 'You must be logged in to create a poll' })
      return
    }
    
    try {
      const result = await createPoll({
        question: data.question.trim(),
        options: data.options.map(option => option.text.trim()),
        expiresAt: data.expiryDate || undefined
      })
      
      if (result.success) {
        router.push('/polls?created=1')
      } else {
        form.setError('root', { message: result.error || 'Failed to create poll' })
      }
    } catch (err) {
      form.setError('root', { message: 'An unexpected error occurred' })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
        <CardDescription>Ask a question and provide options for people to vote on</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {form.formState.errors.root && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What would you like to ask?" 
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormLabel>Options</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`options.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder={`Option ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 2 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleRemoveOption(index)}
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
            
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Creating Poll...' : 'Create Poll'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
