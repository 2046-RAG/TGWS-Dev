import { HelpCircle } from 'lucide-react';

interface HelpTextProps {
  text: string;
  className?: string;
}

export default function HelpText({ text, className = '' }: HelpTextProps) {
  return (
    <p className={`flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1.5 ${className}`}>
      <HelpCircle size={13} className="shrink-0 mt-0.5 text-gray-400 dark:text-gray-500" />
      {text}
    </p>
  );
}
