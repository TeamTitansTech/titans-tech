import { Typography } from '@/components/ui/typography';

interface ErrorDisplayProps {
  errors?: string[];
  translations: {
    title: string;
  };
}

export const ErrorDisplay = ({ errors, translations }: ErrorDisplayProps) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="rounded-md border border-destructive bg-destructive/10 p-4">
      <Typography variant="h3" className="mb-2 text-destructive">
        {translations.title}
      </Typography>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index}>
            <Typography variant="small" className="text-destructive">
              {error}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  );
};
