import { QuickLaunch } from "@/components/molecules/quick-launch";

export function Taskbar() {
  return (
    <div id="taskbar">
      <button className="btn" id="startbtn" type="button"><span id="startlogo" /><b>Start</b></button>
      <QuickLaunch />
      <span className="vsep" />
      <div id="tabs" />
      <div id="tray">
        <button className="trayb" id="testbtn" title="Testimonials — Testimonial Express inbox" type="button" />
        <button className="trayb on" id="crtbtn" title="Toggle CRT scanline filter" type="button" />
        <div id="clock" title="" />
      </div>
    </div>
  );
}
