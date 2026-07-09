'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function CaseStudiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Case Studies error:', error);
  }, [error]);

  return (
    <section className="py-20 px-5 sm:px-8 max-w-5xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-500 mb-8">Failed to load case studies. Please try again.</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full bg-[#00D4FF] text-white font-medium hover:bg-[#00B8DB] transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/en"
          className="px-6 py-3 rounded-full border border-gray-200 text-gray-600 font-medium hover:text-gray-900 hover:border-gray-300 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
