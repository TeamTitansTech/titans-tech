'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Settings, Users, Building2, Cog, Layers } from 'lucide-react';
import { getCompanyUsageStats, updateCompanyLimits } from '@/data/services/companies.api';
import { toast } from 'sonner';
import type { CompanyUsageResponseDto } from '@titans-tech/shared/backend-dtos';
import type { Company } from '@/data/services/companies.api';

interface CompanyUsageStatsProps {
  company: Company;
}

interface UsageCardProps {
  title: string;
  current: number;
  max: number;
  icon: React.ComponentType<{ className?: string }>;
}

function UsageCard({ title, current, max, icon: Icon }: UsageCardProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {current} / {max}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-yellow-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <Badge
            variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {percentage.toFixed(0)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyUsageStats({ company }: CompanyUsageStatsProps) {
  const t = useTranslations('companies');
  const [usage, setUsage] = useState<CompanyUsageResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [limits, setLimits] = useState({
    contractMaxBranches: company.contractMaxBranches,
    contractMaxUsers: company.contractMaxUsers,
    contractMaxMachines: company.contractMaxMachines,
    contractMaxProductionLines: company.contractMaxProductionLines,
  });

  const fetchUsageStats = async () => {
    try {
      const response = await getCompanyUsageStats({ companyId: company.id });
      if (response.data) {
        setUsage(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      toast.error(t('usage.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimits = async () => {
    setIsUpdating(true);
    try {
      const response = await updateCompanyLimits({
        companyId: company.id,
        data: limits,
      });

      if (response.data) {
        toast.success(t('usage.updateSuccess'));
        setIsEditDialogOpen(false);
        // Refresh usage stats to get updated limits
        await fetchUsageStats();
      } else {
        toast.error(t('usage.updateError'));
      }
    } catch (error) {
      console.error('Failed to update limits:', error);
      toast.error(t('usage.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchUsageStats();
  }, [company.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('usage.title')}</CardTitle>
          <CardDescription>{t('usage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('usage.title')}</CardTitle>
          <CardDescription>{t('usage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">{t('usage.loadingError')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('usage.title')}</CardTitle>
          <CardDescription>{t('usage.description')}</CardDescription>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t('usage.editLimits')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('usage.editDialog.title')}</DialogTitle>
              <DialogDescription>
                {t('usage.editDialog.description', { companyName: company.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branches" className="text-right">
                  {t('usage.branches')}
                </Label>
                <Input
                  id="branches"
                  type="number"
                  min="1"
                  value={limits.contractMaxBranches}
                  onChange={(e) =>
                    setLimits((prev) => ({
                      ...prev,
                      contractMaxBranches: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="users" className="text-right">
                  {t('usage.users')}
                </Label>
                <Input
                  id="users"
                  type="number"
                  min="1"
                  value={limits.contractMaxUsers}
                  onChange={(e) =>
                    setLimits((prev) => ({
                      ...prev,
                      contractMaxUsers: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="machines" className="text-right">
                  {t('machines')}
                </Label>
                <Input
                  id="machines"
                  type="number"
                  min="1"
                  value={limits.contractMaxMachines}
                  onChange={(e) =>
                    setLimits((prev) => ({
                      ...prev,
                      contractMaxMachines: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productionLines" className="text-right">
                  {t('usage.productionLines')}
                </Label>
                <Input
                  id="productionLines"
                  type="number"
                  min="1"
                  value={limits.contractMaxProductionLines}
                  onChange={(e) =>
                    setLimits((prev) => ({
                      ...prev,
                      contractMaxProductionLines: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                {t('usage.editDialog.cancel')}
              </Button>
              <Button onClick={handleUpdateLimits} disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isUpdating ? t('usage.editDialog.updating') : t('usage.editDialog.update')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageCard
            title={t('usage.branches')}
            current={usage.usage.branches.current}
            max={usage.usage.branches.max}
            icon={Building2}
          />
          <UsageCard
            title={t('usage.users')}
            current={usage.usage.users.current}
            max={usage.usage.users.max}
            icon={Users}
          />
          <UsageCard
            title={t('machines')}
            current={usage.usage.machines.current}
            max={usage.usage.machines.max}
            icon={Cog}
          />
          <UsageCard
            title={t('usage.productionLines')}
            current={usage.usage.productionLines.current}
            max={usage.usage.productionLines.max}
            icon={Layers}
          />
        </div>
      </CardContent>
    </Card>
  );
}
