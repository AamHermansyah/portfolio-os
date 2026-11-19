/**
 * The handful of icons the Simple view needs, drawn as plain strokes so they
 * share one weight and take the colour of the text around them.
 */

type IconProps = { size?: number };

function Svg({ size = 16, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20l1.3-4.2A8 8 0 1 1 8.2 18.8L4 20z" />
      <path d="M9.3 9.2c.3 2 2.2 3.9 4.4 4.6l1.1-1.1-1.5-1-.8.7a3.6 3.6 0 0 1-1.7-1.7l.7-.8-1-1.5-1.2 1.8z" />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </Svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19.5h14" />
    </Svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 17L17 7M9 7h8v8" />
    </Svg>
  );
}

export function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      height={size}
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z" />
    </svg>
  );
}
