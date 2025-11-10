'use client';

import { Building2 } from 'lucide-react';
import { type Company } from '@/data/services/companies.api';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="max-w-4xl">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Large-scale manufacturing operation
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
