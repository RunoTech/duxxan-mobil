import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'pulse' | 'bounce' | 'glow' | 'shake';
  pressEffect?: boolean;
}

export function AnimatedButton({ 
  className, 
  animationType,
  pressEffect = true,
  children,
  ...props 
}: AnimatedButtonProps) {
  const animationClass = animationType ? `animate-${animationType.replace(/([A-Z])/g, '-$1').toLowerCase()}` : '';
  const pressClass = pressEffect ? 'btn-press' : '';

  return (
    <Button 
      className={cn(
        animationClass,
        pressClass,
        'gpu-accelerated',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}