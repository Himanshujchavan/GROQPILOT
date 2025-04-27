"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, ChevronDown, ChevronUp, Laptop, Mail, Globe, FileText, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface DesktopCommandResultProps {
  app: string
  action: string
  result: any
  success: boolean
}

export function DesktopCommandResult({ app, action, result, success }: DesktopCommandResultProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "Command result copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const getAppIcon = () => {
    switch (app.toLowerCase()) {
      case "email":
        return <Mail className="h-5 w-5" />
      case "browser":
        return <Globe className="h-5 w-5" />
      case "crm":
        return <Users className="h-5 w-5" />
      case "files":
        return <FileText className="h-5 w-5" />
      default:
        return <Laptop className="h-5 w-5" />
    }
  }

  const formatActionTitle = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const renderResultContent = () => {
    if (!result) return <p>No result data available</p>

    if (app.toLowerCase() === "email" && action.toLowerCase() === "summarize") {
      return (
        <div className="space-y-2">
          <p>{result.summary}</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {result.unreadCount} Unread
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {result.importantCount} Important
            </Badge>
          </div>
        </div>
      )
    }

    if (app.toLowerCase() === "crm" && action.toLowerCase() === "find_customer") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Customer Found
            </Badge>
            <span className="font-medium">{result.customerName}</span>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Recent Interactions:</h4>
            <ul className="space-y-1">
              {result.recentInteractions?.map((interaction: any, i: number) => (
                <li key={i} className="text-sm border-l-2 border-gray-200 pl-2">
                  <span className="font-medium">{interaction.date}</span> - {interaction.type}: {interaction.summary}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    if (app.toLowerCase() === "files" && action.toLowerCase() === "search") {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Files Found:</h4>
          <ul className="space-y-2">
            {result.filesFound?.map((file: any, i: number) => (
              <li key={i} className="text-sm p-2 bg-gray-50 rounded-md">
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-gray-500">{file.path}</div>
                <div className="text-xs text-gray-500">Modified: {file.modified}</div>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    // Default rendering for other result types
    return (
      <div className="space-y-2">
        {Object.entries(result).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm font-medium">
              {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
            </span>
            <span className="text-sm">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={success ? "border-green-200" : "border-red-200"}>
        <CardHeader className={`pb-2 ${success ? "bg-green-50" : "bg-red-50"}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${success ? "bg-green-100" : "bg-red-100"}`}>{getAppIcon()}</div>
              <CardTitle>{formatActionTitle(action)}</CardTitle>
            </div>
            <Badge variant={success ? "outline" : "destructive"} className={success ? "bg-green-50" : ""}>
              {app.toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            {success ? `Successfully executed ${action} on ${app}` : `Failed to execute ${action} on ${app}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {success ? (
            renderResultContent()
          ) : (
            <p className="text-red-600">{result?.error || "An unknown error occurred"}</p>
          )}

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="bg-muted p-3 rounded-md overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Show Details
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Copy Result
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
