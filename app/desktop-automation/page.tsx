import type { Metadata } from "next"
import { MainLayout } from "@/components/main-layout"
import { PythonAutomation } from "@/components/desktop-automation/python-automation"
import { TauriEventListener } from "@/components/desktop-automation/event-listener"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowBuilder } from "@/components/desktop-automation/workflow-builder"
import { CommandHistory } from "@/components/desktop-automation/command-history"
import { TaskScheduler } from "@/components/desktop-automation/task-scheduler"

export const metadata: Metadata = {
  title: "Desktop Automation",
  description: "Control desktop applications using Python automation",
}

export default function DesktopAutomationPage() {
  return (
    <MainLayout>
      {/* Event listener for Tauri events */}
      <TauriEventListener />

      <div className="container mx-auto py-6 space-y-8">
        <h1 className="text-3xl font-bold">Desktop Automation</h1>
        <p className="text-muted-foreground">
          Control desktop applications like Word, Excel, Outlook, and more using Python automation.
        </p>

        <Tabs defaultValue="automation">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          </TabsList>
          <TabsContent value="automation" className="mt-6">
            <PythonAutomation />
          </TabsContent>
          <TabsContent value="workflows" className="mt-6">
            <WorkflowBuilder />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <CommandHistory />
          </TabsContent>
          <TabsContent value="scheduler" className="mt-6">
            <TaskScheduler />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
