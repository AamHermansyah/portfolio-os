import { AdminBridge } from "@/components/atoms/admin-bridge";
import { CrtFilter } from "@/components/atoms/crt-filter";
import { PortfolioRuntime } from "@/components/atoms/portfolio-runtime";
import { BootScreen } from "@/components/molecules/boot-screen";
import { DesktopShell } from "@/components/organisms/desktop-shell";
import { StartMenu } from "@/components/organisms/start-menu";
import { SystemOverlay } from "@/components/organisms/system-overlay";
import { Taskbar } from "@/components/organisms/taskbar";
import type { PortfolioContent } from "@/lib/portfolio/contract";

export function PortfolioTemplate({ content }: { content: PortfolioContent }) {
  return (
    <>
      <BootScreen />
      <DesktopShell />
      <Taskbar />
      <StartMenu />
      <SystemOverlay />
      <CrtFilter />
      <AdminBridge />
      <PortfolioRuntime content={content} />
    </>
  );
}
