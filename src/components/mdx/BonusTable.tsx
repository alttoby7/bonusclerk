interface BonusTableRow {
  bank: string;
  bonus: string;
  requirement: string;
  timeframe: string;
  link?: string;
}

export function BonusTable({ rows, caption }: { rows: BonusTableRow[]; caption?: string }) {
  return (
    <div className="my-6 overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        {caption && <caption className="mb-2 text-left text-xs text-text-tertiary">{caption}</caption>}
        <thead>
          <tr className="border-b-2 border-border bg-surface-raised text-left">
            <th className="py-3 px-4 font-semibold text-text-primary">Bank</th>
            <th className="py-3 px-4 font-semibold text-text-primary">Bonus</th>
            <th className="py-3 px-4 font-semibold text-text-primary">Requirement</th>
            <th className="py-3 px-4 font-semibold text-text-primary">Timeframe</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-3 px-4 font-medium text-text-primary">{row.bank}</td>
              <td className="py-3 px-4 font-money font-bold text-success">{row.bonus}</td>
              <td className="py-3 px-4 text-text-secondary">{row.requirement}</td>
              <td className="py-3 px-4 text-text-tertiary">{row.timeframe}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
