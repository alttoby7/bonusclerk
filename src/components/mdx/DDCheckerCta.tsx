import { Button } from '@/components/ui/Button';

export function DDCheckerCta({
  bank,
  text = 'Check if your transfer counts as a direct deposit before you send it.',
}: {
  bank?: string;
  text?: string;
}) {
  const href = bank ? `/dd-checker/${bank}` : '/dd-checker';

  return (
    <div className="my-6 rounded-xl border border-accent/20 bg-accent-dim p-5">
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0">🔍</div>
        <div>
          <h4 className="font-semibold text-text-primary">DD Compatibility Checker</h4>
          <p className="mt-1 text-sm text-text-secondary">{text}</p>
          <div className="mt-3">
            <Button href={href} size="sm">Check Compatibility →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
