"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FirebaseNotice() {
  return (
    <Alert variant="destructive" className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-600 dark:text-red-400 font-medium">Firebase Not Configured</AlertTitle>
      <AlertDescription className="text-red-600 dark:text-red-400">
        <p className="mb-2">
          Firebase authentication is not properly configured. To enable login functionality, please add your Firebase
          credentials to the environment variables.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
            asChild
          >
            <Link href="https://firebase.google.com/docs/web/setup" target="_blank" rel="noopener noreferrer">
              Firebase Setup Guide
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
            asChild
          >
            <Link
              href="https://vercel.com/docs/concepts/projects/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel Environment Variables
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
