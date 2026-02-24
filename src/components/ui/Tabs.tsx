'use client';

import { useState } from 'react';

export function Tabs({
  tabs,
  children,
}: {
  tabs: string[];
  children: (activeTab: string) => React.ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--border-color)] mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
              active === tab
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent)]/5'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
