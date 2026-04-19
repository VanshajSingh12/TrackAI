import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function AuthCard({ children, title, subtitle }) {
  return (
    <div className="max-w-md w-full space-y-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100 mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        <p className="mt-1.5 text-xs text-gray-500 font-medium tracking-wide uppercase">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
