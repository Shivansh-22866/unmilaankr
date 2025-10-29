import { AlertTriangle, TrendingUp, Activity, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { AnomalyAlert } from "@/types/agent"

export default function EnhancedAnomalyAlert({ alert }: { alert: AnomalyAlert }) {
  const getIcon = () => {
    switch (alert.metric.toLowerCase()) {
      case "github":
        return <Activity className="h-4 w-4" />
      case "social":
        return <TrendingUp className="h-4 w-4" />
      case "community":
        return <Users className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = () => {
    switch (alert.severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <Alert className="border-l-4 border-l-orange-500">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{alert.metric}</span>
            <Badge variant={getSeverityColor() as 'destructive' | 'default' | 'secondary'} className="text-xs">
              {alert.severity}
            </Badge>
          </div>
          <AlertDescription className="text-sm text-gray-600">{alert.description}</AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
