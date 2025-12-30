import AlertManager from '@/components/AlertManager'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertManager />
    </ProtectedRoute>
  )
}

