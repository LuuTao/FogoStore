'use client';

import React from 'react';

interface ProductSalesPolicyProps {
  policy?: string | null;
  fallback: React.ReactNode;
}

/** Renders the policy configured by the administrator, while keeping the store default as a fallback. */
export default function ProductSalesPolicy({ policy, fallback }: ProductSalesPolicyProps) {
  const policyItems = String(policy || '')
    .split(/\r?\n/)
    .map((item) => item.replace(/^\s*(?:[-•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

  if (policyItems.length === 0) return <>{fallback}</>;

  return (
    <ul className="space-y-2.5 list-disc list-inside font-medium text-gray-700">
      {policyItems.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}
