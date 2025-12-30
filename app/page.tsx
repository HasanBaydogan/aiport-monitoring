import MainDashboard from '@/components/MainDashboard'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Home() {
  return (
    <ProtectedRoute>
      <MainDashboard />
    </ProtectedRoute>
  )
}

