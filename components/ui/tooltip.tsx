'use client';
 
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
 
function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}
 
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}
 
function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}
 
function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-[rgba(var(--background-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] animate-fade-in animate-scale-in z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance group',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="h-[6px] w-[12px] fill-[rgba(var(--background-primary-rgb))] stroke-[rgba(var(--border-primary-rgb))] stroke-1 z-50" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
 
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
