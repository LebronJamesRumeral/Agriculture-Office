import { AlertCircle, CheckCircle, Info } from 'lucide-react'

interface Notification {
  id: number
  message: string
  timestamp: string
  type: 'info' | 'warning' | 'success'
}

interface NotificationsPanelProps {
  notifications: Notification[]
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10'
      case 'success':
        return 'bg-green-500/10'
      default:
        return 'bg-blue-500/10'
    }
  }

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="flex gap-3 rounded-lg p-3 hover:bg-muted">
            <div className={`rounded-lg p-2 ${getBgColor(notification.type)}`}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.timestamp}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
