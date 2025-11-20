'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MonthlyData {
  month: string;
  inspections: number;
  maintenance: number;
  total: number;
}

interface ServiceTrendsChartProps {
  data: MonthlyData[];
}

export function ServiceTrendsChart({ data }: ServiceTrendsChartProps) {
  const t = useTranslations('dashboard.client.serviceTrends');

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="inspections"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#colorInspections)"
                name={t('legend.inspections')}
              />
              <Area
                type="monotone"
                dataKey="maintenance"
                stackId="1"
                stroke="#f97316"
                fill="url(#colorMaintenance)"
                name={t('legend.maintenance')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {data.reduce((sum, month) => sum + month.inspections, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('stats.totalInspections')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {data.reduce((sum, month) => sum + month.maintenance, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('stats.totalMaintenance')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {data.reduce((sum, month) => sum + month.total, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('stats.totalServices')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
