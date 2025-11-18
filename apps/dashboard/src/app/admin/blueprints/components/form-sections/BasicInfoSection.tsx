import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';

interface BasicInfoSectionProps {
  name: string;
  setName: (name: string) => void;
  translations: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
  };
}

export const BasicInfoSection = ({ name, setName, translations }: BasicInfoSectionProps) => {
  return (
    <section className="space-y-4">
      <div>
        <Typography variant="h3" className="mb-4">
          {translations.title}
        </Typography>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{translations.nameLabel} *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={translations.namePlaceholder}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
