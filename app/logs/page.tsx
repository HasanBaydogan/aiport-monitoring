import LogViewer from '@/components/LogViewer'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function LogsPage() {
  return (
    <ProtectedRoute>
      <LogViewer />
    </ProtectedRoute>
  )
}

