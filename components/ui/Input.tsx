import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', label, error, id, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`flex h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className} ${error ? 'border-red-900 focus-visible:ring-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};