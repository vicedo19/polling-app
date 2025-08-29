import { SignUpForm } from '@/app/components/auth/sign-up-form'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      {/* <h1 className="text-3xl font-bold mb-8">Poll App</h1> */}
      <SignUpForm />
      <p className="mt-4 text-sm text-center">
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}