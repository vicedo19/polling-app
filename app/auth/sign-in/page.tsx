import { SignInForm } from '@/app/components/auth/sign-in-form'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      {/* <h1 className="text-3xl font-bold mb-8">Poll App</h1> */}
      <SignInForm />
      <p className="mt-4 text-sm text-center">
        Don&apos;t have an account?{' '}
        <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}