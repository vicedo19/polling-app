import { Poll } from './types'

export const mockPolls: Poll[] = [
  {
    id: '1',
    question: 'What is your favorite programming language?',
    options: [
      { id: '1-1', text: 'JavaScript', votes: 42 },
      { id: '1-2', text: 'Python', votes: 35 },
      { id: '1-3', text: 'TypeScript', votes: 28 },
      { id: '1-4', text: 'Java', votes: 15 },
    ],
    createdBy: 'John Doe',
    createdAt: '2023-08-15T10:30:00Z',
    isActive: true,
  },
  {
    id: '2',
    question: 'Which frontend framework do you prefer?',
    options: [
      { id: '2-1', text: 'React', votes: 56 },
      { id: '2-2', text: 'Vue', votes: 34 },
      { id: '2-3', text: 'Angular', votes: 23 },
      { id: '2-4', text: 'Svelte', votes: 18 },
    ],
    createdBy: 'Jane Smith',
    createdAt: '2023-08-10T14:20:00Z',
    isActive: true,
  },
  {
    id: '3',
    question: 'What is your preferred database?',
    options: [
      { id: '3-1', text: 'PostgreSQL', votes: 38 },
      { id: '3-2', text: 'MongoDB', votes: 32 },
      { id: '3-3', text: 'MySQL', votes: 27 },
      { id: '3-4', text: 'SQLite', votes: 14 },
    ],
    createdBy: 'Alex Johnson',
    createdAt: '2023-08-05T09:15:00Z',
    isActive: true,
  },
  {
    id: '4',
    question: 'Which cloud provider do you use most?',
    options: [
      { id: '4-1', text: 'AWS', votes: 45 },
      { id: '4-2', text: 'Azure', votes: 30 },
      { id: '4-3', text: 'Google Cloud', votes: 25 },
      { id: '4-4', text: 'Digital Ocean', votes: 12 },
    ],
    createdBy: 'Sarah Williams',
    createdAt: '2023-07-28T16:45:00Z',
    isActive: false,
    expiresAt: '2023-08-11T16:45:00Z',
  },
]

export function getPollById(id: string): Poll | undefined {
  return mockPolls.find(poll => poll.id === id)
}