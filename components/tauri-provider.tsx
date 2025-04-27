"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface TauriContextType {
  isTauri: boolean
  isReady: boolean
}

const TauriContext = createContext<TauriContextType>({
  isTauri: false,
  isReady: false,
})

export function useTauri() {
  return useContext(TauriContext)
}

export function TauriProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TauriContextType>({
    isTauri: false,
    isReady: false,
  })

  useEffect(() => {
    const checkTauri = async () => {
      try {
        // Check if we're running in a Tauri environment
        // This will throw an error if we're not
        const { invoke } = await import("@tauri-apps/api/tauri")

        // If we get here, we're in a Tauri environment
        setState({
          isTauri: true,
          isReady: true,
        })

        console.log("Running in Tauri environment")
      } catch (e) {
        // We're not in a Tauri environment
        setState({
          isTauri: false,
          isReady: true,
        })

        console.log("Not running in Tauri environment, using web fallbacks")
      }
    }

    checkTauri()
  }, [])

  return <TauriContext.Provider value={state}>{children}</TauriContext.Provider>
}
