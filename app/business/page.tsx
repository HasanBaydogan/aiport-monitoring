import BusinessDashboard from '@/components/BusinessDashboard'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function BusinessPage() {
  return (
    <ProtectedRoute>
      <BusinessDashboard />
    </ProtectedRoute>
  )
}

