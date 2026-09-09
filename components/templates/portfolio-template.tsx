import { CrtFilter } from "@/components/atoms/crt-filter";
import { PortfolioRuntime } from "@/components/atoms/portfolio-runtime";
import { BootScreen } from "@/components/molecules/boot-screen";
import { DesktopShell } from "@/components/organisms/desktop-shell";
import { StartMenu } from "@/components/organisms/start-menu";
import { SystemOverlay } from "@/components/organisms/system-overlay";
import { Taskbar } from "@/components/organisms/taskbar";

export function PortfolioTemplate() {
  return (
    <>
      <BootScreen />
      <DesktopShell />
      <Taskbar />
      <StartMenu />
      <SystemOverlay />
      <CrtFilter />
      <PortfolioRuntime />
    </>
  );
}
