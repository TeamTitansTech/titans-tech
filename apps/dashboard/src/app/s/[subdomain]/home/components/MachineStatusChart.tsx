'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MachineStatusData {
  operational: number;
  warning: number;
  critical: number;
}

interface MachineStatusChartProps {
  data: MachineStatusData;
}

const COLORS = {
  operational: '#22c55e', // green
  warning: '#eab308', // yellow
  critical: '#ef4444', // red
};

export function MachineStatusChart({ data }: MachineStatusChartProps) {
  const t = useTranslations('dashboard.client.machineStatus');

  const chartData = [
    { name: t('status.operational'), value: data.operational, color: COLORS.operational },
    { name: t('status.warning'), value: data.warning, color: COLORS.warning },
    { name: t('status.critical'), value: data.critical, color: COLORS.critical },
  ].filter((item) => item.value > 0); // Only show non-zero values

  const total = data.operational + data.warning + data.critical;

  // Custom label for the center of the donut
  const renderCustomLabel = ({
    cx,
    cy,
  }: {
    cx: number;
    cy: number;
  }) => {
    return (
      <text
        x={cx}
        y={cy}
        fill="hsl(var(--foreground))"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan x={cx} y={cy - 10} fontSize="32" fontWeight="bold">
          {total}
        </tspan>
        <tspan x={cx} y={cy + 15} fontSize="14" fill="hsl(var(--muted-foreground))">
          {t('totalMachines')}
        </tspan>
      </text>
    );
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
              />
              {renderCustomLabel({ cx: 150, cy: 150 })}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed breakdown */}
        <div className="space-y-3 mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">{t('status.operational')}</span>
            </div>
            <span className="font-medium">
              {data.operational} ({total > 0 ? Math.round((data.operational / total) * 100) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-muted-foreground">{t('status.warning')}</span>
            </div>
            <span className="font-medium">
              {data.warning} ({total > 0 ? Math.round((data.warning / total) * 100) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">{t('status.critical')}</span>
            </div>
            <span className="font-medium">
              {data.critical} ({total > 0 ? Math.round((data.critical / total) * 100) : 0}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
