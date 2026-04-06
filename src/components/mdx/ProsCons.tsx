export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="my-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-success/30 bg-success-light/30 p-4">
        <h4 className="mb-2 font-semibold text-success">Pros</h4>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          {pros.map((pro, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-success shrink-0">+</span>
              {pro}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-danger/30 bg-danger-light/30 p-4">
        <h4 className="mb-2 font-semibold text-danger">Cons</h4>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          {cons.map((con, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-danger shrink-0">-</span>
              {con}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
