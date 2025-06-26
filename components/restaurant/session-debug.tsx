"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { debugUserSession } from "@/app/restaurant/profile/actions"
import { RefreshCw, Bug } from "lucide-react"

export function SessionDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDebug = async () => {
    setIsLoading(true)
    try {
      const result = await debugUserSession()
      setDebugInfo(result)
    } catch (error) {
      setDebugInfo({ success: false, error: "Failed to debug session" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-800">
          <Bug className="w-5 h-5" />
          <span>Session Debug Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDebug} disabled={isLoading} variant="outline" size="sm">
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Debugging...
            </>
          ) : (
            <>
              <Bug className="w-4 h-4 mr-2" />
              Debug Session
            </>
          )}
        </Button>

        {debugInfo && (
          <div className="mt-4 p-4 bg-white rounded border">
            <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
