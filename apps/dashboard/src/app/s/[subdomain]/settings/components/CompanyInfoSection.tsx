'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, MapPin, Phone, Globe, User } from 'lucide-react';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { getCompany, type Company } from '@/data/services/companies.api';
import { getAllUsers } from '@/data/services/users.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { UserResponseDto } from '@titans-tech/shared';

export function CompanyInfoSection() {
  const t = useTranslations('settings.companyInfo');
  const { companyUser } = useCompanyUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyAdmin, setCompanyAdmin] = useState<UserResponseDto | null>(null);
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
          const admin = usersResponse.data.find(
            (user) => user.isCompanyAdmin || user.isCompanyManager,
          );
          setCompanyAdmin(admin || null);
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
            <Badge variant="success" className="ml-2">
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

        {/* Company Administrator */}
        {companyAdmin && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {t('administrator')}
                </h3>
                <p className="text-base font-medium">{companyAdmin.name || t('unknownUser')}</p>
                <p className="text-sm text-muted-foreground">{companyAdmin.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t('createdAt')}</span>
              <p className="font-medium">
                {new Date(company.createdAt).toLocaleDateString()}
              </p>
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