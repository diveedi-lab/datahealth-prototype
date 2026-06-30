import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

// Wrapper presentazionale: etichetta in tooltip su un controllo (di solito a sola icona).
// Non cambia il comportamento del figlio; richiede un singolo elemento che inoltra ref.
export function IconTip({
  label, side = 'bottom', children,
}: {
  label: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}
