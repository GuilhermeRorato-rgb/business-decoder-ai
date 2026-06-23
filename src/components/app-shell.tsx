import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { KnowledgeSidebar } from "./knowledge-sidebar";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <KnowledgeSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
