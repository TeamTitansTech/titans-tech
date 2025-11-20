'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FleetHealthScoreProps {
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  criticalCount: number;
  warningCount: number;
  totalMachines: number;
}

export function FleetHealthScore({
  score,
  trend,
  criticalCount,
  warningCount,
  totalMachines,
}: FleetHealthScoreProps) {
  const t = useTranslations('dashboard.client');

  // Determine grade based on score
  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const { grade, color, bg } = getGrade(score);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('fleetHealth.title')}</CardTitle>
        <CardDescription>{t('fleetHealth.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Score Display */}
          <div className="flex items-center gap-6">
            <div className={`${bg} ${color} rounded-2xl p-8 text-center min-w-[140px]`}>
              <div className="text-6xl font-bold">{grade}</div>
              <div className="text-sm font-medium mt-1">{score}%</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                <span className="text-sm text-muted-foreground">
                  {t(`fleetHealth.trend.${trend}`)}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>
                    {totalMachines - criticalCount - warningCount} {t('fleetHealth.operational')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>
                    {warningCount} {t('fleetHealth.warning')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>
                    {criticalCount} {t('fleetHealth.critical')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Text */}
          <div className="text-right hidden md:block max-w-xs">
            <p className="text-sm text-muted-foreground">{t('fleetHealth.summary')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
