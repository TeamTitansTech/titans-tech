'use client';

import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface OuterInnerTabsProps {
  outerContent: ReactNode;
  innerContent: ReactNode;
  outerLabel?: string;
  innerLabel?: string;
  defaultTab?: 'outer' | 'inner';
  className?: string;
  tabsListClassName?: string;
}

export function OuterInnerTabs({
  outerContent,
  innerContent,
  outerLabel = 'Outer',
  innerLabel = 'Inner',
  defaultTab = 'outer',
  className,
  tabsListClassName,
}: OuterInnerTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className={cn('w-full', className)}>
      <TabsList className={cn('grid w-full grid-cols-2 mb-4', tabsListClassName)}>
        <TabsTrigger value="outer">{outerLabel}</TabsTrigger>
        <TabsTrigger value="inner">{innerLabel}</TabsTrigger>
      </TabsList>

      <TabsContent value="outer" className="space-y-6">
        {outerContent}
      </TabsContent>

      <TabsContent value="inner" className="space-y-6">
        {innerContent}
      </TabsContent>
    </Tabs>
  );
}
