import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  trackClass?: string;
  className?: string;
  formatValue?: (value: number) => string;
}

const RadialGauge = ({
  value,
  max,
  label,
  sublabel,
  size = 140,
  strokeWidth = 10,
  colorClass = "stroke-primary",
  trackClass = "stroke-muted",
  className,
  formatValue,
}: RadialGaugeProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference - percentage * circumference;
  const displayValue = formatValue ? formatValue(value) : `${value}`;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={trackClass}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn(colorClass, "transition-all duration-700 ease-out")}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-heading font-bold text-foreground leading-none", displayValue.length > 3 ? "text-base" : "text-2xl")}>
            {displayValue}
          </span>
          {sublabel && (
            <span className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export { RadialGauge };
