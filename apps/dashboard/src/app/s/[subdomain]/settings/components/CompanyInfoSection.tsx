'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, MapPin, Phone, Globe, User, Lock, Shield } from 'lucide-react';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { getCompany, type Company } from '@/data/services/companies.api';
import { getAllUsers } from '@/data/services/users.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserResponseDto } from '@titans-tech/shared/backend-dtos';

export function CompanyInfoSection() {
  const t = useTranslations('settings.companyInfo');
  const { companyUser } = useCompanyUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyAdmin, setCompanyAdmin] = useState<UserResponseDto | null>(null);
  const [companyManagers, setCompanyManagers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCompanyInfo() {
      if (!companyUser?.companyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [companyResponse, usersResponse] = await Promise.all([
          getCompany({ companyId: companyUser.companyId }),
          getAllUsers({ companyId: companyUser.companyId }),
        ]);

        if (!companyResponse.errors && companyResponse.data) {
          setCompany(companyResponse.data);
        }

        if (!usersResponse.errors && usersResponse.data) {
          // Find Company Admin
          const admin = usersResponse.data.find((user) => user.isCompanyAdmin);
          setCompanyAdmin(admin || null);

          // Find Company Managers
          const managers = usersResponse.data.filter(
            (user) => user.isCompanyManager && !user.isCompanyAdmin,
          );
          setCompanyManagers(managers);
        }
      } catch (error) {
        console.error('Error loading company info:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanyInfo();
  }, [companyUser]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-muted-foreground">{t('noCompanyFound')}</h2>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{t('title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
            </div>
          </div>
          {company.isActive && (
            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
              {t('active')}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('companyName')}</h3>
              <p className="text-base font-medium">{company.name}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            {company.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('address')}</h3>
                  <p className="text-sm">{company.address}</p>
                </div>
              </div>
            )}

            {company.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('phone')}</h3>
                  <p className="text-sm">{company.phone}</p>
                </div>
              </div>
            )}

            {company.website && (
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('website')}</h3>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Administrator (with special badge) */}
        {companyAdmin && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {t('administrator')}
                  </h3>
                  <Badge className="bg-purple-600 hover:bg-purple-700">Company Admin</Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lock className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">
                          Only one Company Admin per company. Contact system administrator to
                          change.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-base font-medium">{companyAdmin.name || t('unknownUser')}</p>
                <p className="text-sm text-muted-foreground">{companyAdmin.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Company Managers */}
        {companyManagers.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Company Managers</h3>
                  <Badge variant="secondary">
                    {companyManagers.length} {companyManagers.length === 1 ? 'Manager' : 'Managers'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {companyManagers.map((manager) => {
                    const branchNames =
                      manager.branches
                        ?.map((b) => b.branch?.name)
                        .filter(Boolean)
                        .join(', ') || 'All branches';

                    return (
                      <div
                        key={manager.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{manager.name || t('unknownUser')}</p>
                          <p className="text-xs text-muted-foreground">{manager.email}</p>
                          <p className="text-xs text-blue-600 mt-0.5">{branchNames}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t('createdAt')}</span>
              <p className="font-medium">{new Date(company.createdAt).toLocaleDateString()}</p>
            </div>
            {companyUser?.branches && companyUser.branches.length > 0 && (
              <div>
                <span className="text-muted-foreground">{t('branches')}</span>
                <p className="font-medium">{companyUser.branches.length}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
