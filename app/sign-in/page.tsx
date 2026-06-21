import Link from 'next/link'

export default function SignIn() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-semibold">
            Write<span className="font-bold">Arabic</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to continue your progress</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-xs text-green-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-green-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
