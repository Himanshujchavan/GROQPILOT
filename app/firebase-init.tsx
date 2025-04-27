"use client"

import { useEffect } from "react"
import { initializeFirebase, enableFirestorePersistence } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"

export function FirebaseClientInit() {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      try {
        // Initialize Firebase
        const { app, auth, db } = initializeFirebase()

        if (!app) {
          console.warn("Firebase initialization failed or configuration is missing")
          return
        }

        // Small delay to ensure Firebase is fully initialized
        const timer = setTimeout(() => {
          try {
            enableFirestorePersistence()
            console.log("Firebase fully initialized and persistence enabled")
          } catch (error) {
            console.error("Error in FirebaseClientInit:", error)
          }
        }, 1000)

        return () => clearTimeout(timer)
      } catch (error) {
        console.error("Error initializing Firebase in FirebaseClientInit:", error)
        toast({
          title: "Firebase Initialization Error",
          description: "Could not initialize Firebase. Some features may not work.",
          variant: "destructive",
        })
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}

// Also export as default for backward compatibility
export default FirebaseClientInit
