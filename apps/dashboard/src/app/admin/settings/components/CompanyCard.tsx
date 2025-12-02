'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, User } from 'lucide-react';
import { type Company } from '@/data/services/companies.api';
import { getAllUsers } from '@/data/services/users.api';
import { Card, CardContent } from '@/components/ui/card';
import type { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const t = useTranslations('adminSettings.companyCard');
  const [companyAdmin, setCompanyAdmin] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyAdmin() {
      setIsLoading(true);
      try {
        const response = await getAllUsers({ companyId: company.id });
        if (response.data) {
          const admin = response.data.find((user) => user.isCompanyAdmin || user.isCompanyManager);
          setCompanyAdmin(admin || null);
        }
      } catch (error) {
        console.error('Failed to fetch company admin:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanyAdmin();
  }, [company.id]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold">{company.name}</h3>
            </div>

            {!isLoading && companyAdmin && (
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('administrator')}
                  </span>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium">{companyAdmin.name || t('unknownUser')}</p>
                  <p className="text-xs text-muted-foreground">{companyAdmin.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
