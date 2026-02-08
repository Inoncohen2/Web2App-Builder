import React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, id }) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`
        peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-white' : 'bg-zinc-700'}
      `}
    >
      <span
        className={`
          pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform
          ${checked ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'}
        `}
      />
    </button>
  );
};