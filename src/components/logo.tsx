import Link from "next/link";

interface LogoProps {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 9, text: "text-sm", tagline: "text-[8px]", gap: 2.5 },
  md: { icon: 10, text: "text-base", tagline: "text-[10px]", gap: 3 },
  lg: { icon: 14, text: "text-2xl", tagline: "text-xs", gap: 4 },
};

const LogoMark = ({ size = 9 }: { size: number }) => (
  <div
    className={`relative rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0`}
    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
  >
    <svg viewBox="0 0 36 36" fill="none" className="text-white" style={{ width: `${size * 2.5}px`, height: `${size * 2.5}px` }}>
      {/* Geometric S / infinity-like mark */}
      <path
        d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z"
        stroke="currentColor" strokeWidth="1.5" opacity="0.3"
      />
      <path
        d="M18 8c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S23.523 8 18 8z"
        stroke="currentColor" strokeWidth="1.2" opacity="0.4"
      />
      {/* Central diamond/VR icon */}
      <path
        d="M18 12l-6 6 6 6 6-6-6-6z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
      <path
        d="M13 18h10M18 13v10"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
      />
      {/* VR headset silhouette */}
      <path
        d="M12 20c0 0 1.5-3 6-3s6 3 6 3"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"
      />
      <circle cx="14" cy="20" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="20" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  </div>
);

export function Logo({ href = "/", showText = true, size = "md", className = "" }: LogoProps) {
  const s = sizes[size];

  const content = (
    <div className={`flex items-center gap-${s.gap} ${className}`}>
      <LogoMark size={s.icon} />
      {showText && (
        <div>
          <p className={`${s.text} font-bold tracking-tight text-white`}>
            STEAM <span className="text-violet-400">ELMS</span>
          </p>
          {size !== "sm" && (
            <p className={`${s.tagline} text-zinc-500 font-medium tracking-wider uppercase`}>
              CAMPUS Learning Hub
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export function LogoSquare({ size = 24 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 36 36" fill="none" className="text-white" style={{ width: size * 0.6, height: size * 0.6 }}>
        <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        <path d="M18 12l-6 6 6 6 6-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M13 18h10M18 13v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 20c0 0 1.5-3 6-3s6 3 6 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  );
}
