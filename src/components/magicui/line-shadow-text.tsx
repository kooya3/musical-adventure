"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps } from "framer-motion";

interface LineShadowTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  shadowColor?: string;
  as?: React.ElementType;
}

export function LineShadowText({
  children,
  shadowColor = "black",
  className,
  as: Component = "span",
  ...props
}: LineShadowTextProps) {
  const MotionComponent = motion[Component as keyof typeof motion] as any;
  const content = typeof children === "string" ? children : null;

  if (!content) {
    throw new Error("LineShadowText only accepts string content");
  }

  return (
    <MotionComponent
      className={cn("relative inline-block", className)}
      {...props}
    >
      <span className="relative z-10">{content}</span>
      <span 
        className="absolute left-[2px] top-[2px] -z-10 select-none pointer-events-none opacity-50"
        style={{
          background: `linear-gradient(45deg, transparent 45%, ${shadowColor} 45%, ${shadowColor} 55%, transparent 55%)`,
          backgroundSize: '3px 3px',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'line-shadow 15s linear infinite'
        }}
        aria-hidden="true"
      >
        {content}
      </span>
    </MotionComponent>
  );
}