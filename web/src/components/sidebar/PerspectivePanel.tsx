import { useEffect, useState } from 'react';
import { perspectives } from '../../lib/api';

interface Perspective {
  id: string;
  name: string;
  description: string;
  concepts: string[];
}

export function PerspectivePanel() {
  const [items, setItems] = useState<Perspective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    perspectives()
      .then((data) => setItems(data as Perspective[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4 text-sm text-gray-400">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-400">
        <p>内置视角：</p>
        <div className="mt-3 space-y-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="font-medium text-sm text-gray-700 dark:text-gray-300">Lacan</div>
            <p className="text-xs text-gray-500 mt-1">拉康精神分析：能指链、重复、四种话语、RSI 三界</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="font-medium text-sm text-gray-700 dark:text-gray-300">Deleuze</div>
            <p className="text-xs text-gray-500 mt-1">德勒兹装配理论：连接、差异、生成、机器</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {items.map((p) => (
        <div key={p.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {p.name}
          </div>
          <p className="text-xs text-gray-500 mt-1">{p.description}</p>
          {p.concepts?.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {p.concepts.map((c) => (
                <span
                  key={c}
                  className="text-xs px-1.5 py-0.5 rounded bg-symbolic/10 text-symbolic"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
