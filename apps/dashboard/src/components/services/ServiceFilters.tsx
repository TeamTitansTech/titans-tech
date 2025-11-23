'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface ServiceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedMachine: string;
  onMachineChange: (value: string) => void;
  machines: Array<{ id: string; name: string }>;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  branches: Array<{ id: string; name: string }>;
}

export function ServiceFilters({
  searchQuery,
  onSearchChange,
  selectedMachine,
  onMachineChange,
  machines,
  selectedBranch,
  onBranchChange,
  branches,
}: ServiceFiltersProps) {
  const t = useTranslations('services.filters');

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Branch Filter */}
      <Select value={selectedBranch} onValueChange={onBranchChange}>
        <SelectTrigger className="w-full md:w-[250px]">
          <SelectValue placeholder={t('allBranches')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allBranches')}</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Machine Filter */}
      <Select value={selectedMachine} onValueChange={onMachineChange}>
        <SelectTrigger className="w-full md:w-[250px]">
          <SelectValue placeholder={t('allMachines')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allMachines')}</SelectItem>
          {machines.map((machine) => (
            <SelectItem key={machine.id} value={machine.id}>
              {machine.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
