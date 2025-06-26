"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { checkDatabaseSetup } from "@/app/restaurant/actions"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export function DatabaseSetupChecker() {
  const [status, setStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleCheck = async () => {
    setIsChecking(true)
    try {
      const result = await checkDatabaseSetup()
      setStatus(result)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setStatus({
        success: false,
        message: `Check failed: ${errorMessage}`,
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Database Status
          {status && (
            <Badge variant={status.success ? "default" : "destructive"}>{status.success ? "Connected" : "Error"}</Badge>
          )}
        </CardTitle>
        <CardDescription>Check if your database is properly set up and accessible.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg ${
              status.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {status.success ? (
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm">{status.message}</p>
          </div>
        )}

        <Button onClick={handleCheck} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Database
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
