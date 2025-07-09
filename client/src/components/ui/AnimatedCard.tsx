import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends CardProps {
  animationType?: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'fadeInUp';
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ 
  className, 
  animationType = 'fadeInUp',
  delay = 0,
  hover = true,
  children,
  ...props 
}: AnimatedCardProps) {
  const animationClass = `animate-${animationType.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  const hoverClass = hover ? 'card-hover-lift' : '';
  
  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <Card 
      className={cn(
        animationClass,
        hoverClass,
        'gpu-accelerated',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </Card>
  );
}