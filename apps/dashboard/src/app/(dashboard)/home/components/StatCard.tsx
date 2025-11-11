import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Typography } from '@/components/ui/typography';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-orange-500',
}: StatCardProps) {
  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Typography variant="muted" className="font-medium">{title}</Typography>
            <Typography variant="h1" className="text-4xl font-bold text-foreground">{value}</Typography>
          </div>
          <div className={`${iconColor} mt-1`}>
            <Icon className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
