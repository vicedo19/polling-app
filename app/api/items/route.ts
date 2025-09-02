import { NextResponse } from 'next/server'

// Simple in-memory store for demo purposes
// Note: Data will reset on server restart or file change in dev
let items: Array<{ id: number; name: string; createdAt: string }> = []
let nextId = 1

export async function GET() {
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    const name = body?.name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: "name" (non-empty string) is required' },
        { status: 400 }
      )
    }

    const item = {
      id: nextId++,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    }
    items.push(item)

    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}