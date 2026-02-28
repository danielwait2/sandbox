'use client';

type Props = {
  period: string;
  onChange: (p: string) => void;
};

const OPTIONS = [
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: '3 Months', value: '3_months' },
];

export default function PeriodToggle({ period, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            period === opt.value
              ? 'px-4 py-2 rounded-md text-sm font-medium bg-zinc-900 text-white'
              : 'px-4 py-2 rounded-md text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
