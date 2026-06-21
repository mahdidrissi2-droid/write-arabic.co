import Navbar from '@/components/Navbar'
import DailyWidget from '@/components/DailyWidget'

export default function DailyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-1">Today&apos;s challenge</h1>
          <p className="text-sm text-gray-500 mb-8">One new word each day. Trace the full outline until the bar fills.</p>
          <DailyWidget />
        </div>
      </main>
    </>
  )
}
