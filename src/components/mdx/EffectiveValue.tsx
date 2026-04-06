'use client';

import { useState } from 'react';

export function EffectiveValue({
  bonusAmount,
  defaultDeposit = 0,
  holdDays = 90,
  monthlyFee = 0,
  keepOpenMonths = 6,
}: {
  bonusAmount: number;
  defaultDeposit?: number;
  holdDays?: number;
  monthlyFee?: number;
  keepOpenMonths?: number;
}) {
  const [deposit, setDeposit] = useState(defaultDeposit);

  const totalFees = monthlyFee * keepOpenMonths;
  const netValue = bonusAmount - totalFees;
  const taxEstimate = Math.round(bonusAmount * 0.24);
  const afterTax = netValue - taxEstimate;

  const effectiveApy =
    deposit > 0
      ? ((netValue / deposit) * (365 / holdDays) * 100).toFixed(1)
      : '---';

  return (
    <div className="my-8 rounded-xl border border-border bg-surface p-5 not-prose">
      <h4 className="font-bold text-text-primary text-sm uppercase tracking-wide mb-4">
        Effective Value Calculator
      </h4>

      <div className="mb-5">
        <label className="block text-xs font-medium text-text-tertiary mb-1.5">
          Amount you'll deposit
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-money">$</span>
          <input
            type="number"
            value={deposit || ''}
            onChange={e => setDeposit(Number(e.target.value))}
            placeholder="5,000"
            className="w-full rounded-lg border border-border bg-surface-raised pl-7 pr-3 py-2.5 font-money text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-surface-raised p-3 text-center">
          <div className="font-money text-lg font-bold text-success">
            ${netValue.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs text-text-tertiary">Net Value</div>
        </div>
        <div className="rounded-lg bg-surface-raised p-3 text-center">
          <div className="font-money text-lg font-bold text-accent">
            {effectiveApy}%
          </div>
          <div className="mt-0.5 text-xs text-text-tertiary">Effective APY</div>
        </div>
        <div className="rounded-lg bg-surface-raised p-3 text-center">
          <div className="font-money text-lg font-bold text-warning">
            -${taxEstimate.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs text-text-tertiary">Est. Tax (24%)</div>
        </div>
        <div className="rounded-lg bg-surface-raised p-3 text-center">
          <div className="font-money text-lg font-bold text-text-primary">
            ${afterTax.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs text-text-tertiary">After Tax</div>
        </div>
      </div>

      {totalFees > 0 && (
        <p className="mt-3 text-xs text-text-tertiary">
          Includes ${totalFees} in monthly fees over {keepOpenMonths} month hold period.
        </p>
      )}
    </div>
  );
}
