export function QuickAnswer({
  question,
  answer,
  detail,
}: {
  question: string;
  answer: string;
  detail?: string;
}) {
  return (
    <div className="my-8 rounded-xl border-l-4 border-accent bg-surface p-5 shadow-sm not-prose">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">Quick Answer</p>
      <p className="font-bold text-text-primary">{question}</p>
      <p className="mt-2 text-sm text-text-secondary leading-relaxed">{answer}</p>
      {detail && (
        <p className="mt-2 text-xs text-text-tertiary">{detail}</p>
      )}
    </div>
  );
}
