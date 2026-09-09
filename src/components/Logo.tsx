import { cn } from "@/lib/utils";

type LogoProps = { className?: string; showWordmark?: boolean; inverted?: boolean };

export function Logo({ className, showWordmark = true, inverted = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid size-9 place-items-center rounded-xl bg-brand shadow-soft",
          inverted && "bg-card",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none">
          <path
            d="M12 2.5c-3.6 0-6.5 2.8-6.5 6.3 0 4.6 5.5 11.4 6.1 12.1a.5.5 0 0 0 .8 0c.6-.7 6.1-7.5 6.1-12.1 0-3.5-2.9-6.3-6.5-6.3Z"
            className={inverted ? "fill-primary" : "fill-white"}
          />
          <rect
            x="8"
            y="5.6"
            width="8"
            height="6.6"
            rx="1.6"
            className={inverted ? "fill-card" : "fill-primary"}
          />
          <rect x="9.1" y="6.8" width="5.8" height="2.4" rx="0.6" className="fill-accent" />
          <circle cx="9.9" cy="11.4" r="0.9" className="fill-accent" />
          <circle cx="14.1" cy="11.4" r="0.9" className="fill-accent" />
        </svg>
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-lg font-bold tracking-tight",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          BUS<span className="text-accent">TRAKING</span>
        </span>
      ) : null}
    </span>
  );
}
