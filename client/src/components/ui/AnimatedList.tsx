import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
  animationType?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
}

export function AnimatedList({ 
  children, 
  className,
  stagger = true,
  animationType = 'fadeInUp'
}: AnimatedListProps) {
  const staggerClass = stagger ? 'stagger-children' : '';
  
  return (
    <div className={cn(staggerClass, className)}>
      {children}
    </div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedListItem({ 
  children, 
  className,
  delay = 0
}: AnimatedListItemProps) {
  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};
  
  return (
    <div 
      className={cn('animate-fade-in-up gpu-accelerated', className)}
      style={style}
    >
      {children}
    </div>
  );
}