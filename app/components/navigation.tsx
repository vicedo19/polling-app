'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'

export function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  
  const isAuthenticated = !!user
  
  return (
    <header className="border-b">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            ALX Polly
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex gap-6">
              <Link 
                href="/polls" 
                className={`text-sm font-medium ${pathname.startsWith('/polls') ? 'text-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground`}
              >
                Polls
              </Link>
              <Link 
                href="/polls/create" 
                className={`text-sm font-medium ${pathname === '/polls/create' ? 'text-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground`}
              >
                Create Poll
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button variant="ghost" onClick={signOut}>
              Sign Out
            </Button>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}