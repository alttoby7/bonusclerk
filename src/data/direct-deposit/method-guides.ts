import type { MethodGuide } from '@/types/dd-checker';

export const methodGuides: MethodGuide[] = [
  {
    type: 'brokerage',
    title: 'Brokerage ACH Push',
    steps: [
      'Log in to your brokerage account (Fidelity, Schwab, Vanguard, E*TRADE)',
      'Navigate to "Transfer" or "Move Money"',
      'Select "Transfer to bank" or "Withdraw to linked bank"',
      'Enter the amount that meets the bonus requirement',
      'Choose your destination bank account (must be linked first)',
      'Confirm the transfer — it will go out as an ACH push',
    ],
    processingTime: '1-3 business days',
    tips: [
      'Brokerage pushes are the most reliable DD trigger across banks',
      'Link your destination bank account in advance to avoid delays',
      'Fidelity and Schwab are the most widely confirmed sources',
    ],
    warnings: [
      'Make sure you have sufficient settled cash (not margin) to transfer',
    ],
  },
  {
    type: 'bank',
    title: 'Bank-to-Bank ACH Push',
    steps: [
      'Log in to your source bank (Ally, Capital One, Discover, etc.)',
      'Go to "Transfers" or "Send Money"',
      'Add your destination bank as an external account if not already linked',
      'Wait for micro-deposit verification (1-3 days) if required',
      'Initiate an outgoing transfer for the required DD amount',
      'Select standard (ACH) delivery, not wire transfer',
    ],
    processingTime: '1-2 business days',
    tips: [
      'Ally and Capital One pushes are confirmed at most major banks',
      'Some banks let you set up recurring transfers — useful for multi-DD requirements',
    ],
    warnings: [
      'Wire transfers do NOT count as direct deposits — use standard ACH only',
      'External account linking can take 2-5 days, so plan ahead',
    ],
  },
  {
    type: 'fintech',
    title: 'Fintech ACH Push',
    steps: [
      'Log in to your fintech app (Wealthfront, Betterment, Robinhood)',
      'Navigate to transfers or withdraw funds',
      'Select your destination bank account',
      'Enter the required DD amount and confirm',
    ],
    processingTime: '1-3 business days',
    tips: [
      'Wealthfront and Betterment pushes work at many banks',
      'Robinhood works at some banks but results vary',
    ],
    warnings: [
      'Fintech apps sometimes change their ACH originator, which can affect DD detection',
      'Check recent data points before relying on a fintech source',
    ],
  },
  {
    type: 'p2p',
    title: 'P2P / Payment App Transfer',
    steps: [
      'Open the P2P app (PayPal, Venmo, Cash App)',
      'Transfer your balance to your linked bank account',
      'Select "standard" or "free" transfer (not instant)',
    ],
    processingTime: '1-3 business days',
    tips: [
      'PayPal and Venmo occasionally work, but success rates are low',
      'Use a brokerage or bank push instead if possible',
    ],
    warnings: [
      'P2P transfers frequently fail to trigger DD at most banks',
      'Zelle transfers almost never count as direct deposits',
      'Do not rely on P2P as your primary DD method',
    ],
  },
];

export function getMethodGuideForType(type: string): MethodGuide | undefined {
  return methodGuides.find(g => g.type === type);
}
