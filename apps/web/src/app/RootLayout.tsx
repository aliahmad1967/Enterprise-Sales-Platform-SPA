import { Outlet } from "react-router-dom";
import { ToastViewport, TooltipProvider } from "@esp/ui";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { StatusBar } from "@/components/StatusBar";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { AiAssistant } from "@/components/AIAssistant";

export function RootLayout() {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] p-4 lg:p-6">
              <Outlet />
            </div>
          </main>
          <StatusBar />
        </div>
      </div>

      <CommandPalette />
      <NotificationsPanel />
      <AiAssistant />
      <ToastViewport />
    </TooltipProvider>
  );
}
