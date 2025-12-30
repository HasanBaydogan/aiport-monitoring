import TechnicalDashboard from '@/components/TechnicalDashboard'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function TechnicalPage() {
  return (
    <ProtectedRoute>
      <TechnicalDashboard />
    </ProtectedRoute>
  )
}

