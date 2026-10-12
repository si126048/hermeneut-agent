import { useState } from 'react';
import { theorySearch } from '../../lib/api';

interface SearchResult {
  source_id: string;
  text: string;
  score: number;
}

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await theorySearch(query);
      setResults(data as SearchResult[]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索理论语料库..."
          className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-transparent text-gray-800 dark:text-gray-200 outline-none focus:border-symbolic"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-symbolic text-white text-xs font-medium disabled:opacity-50 hover:bg-symbolic/90"
        >
          {loading ? '...' : '搜索'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="text-xs text-gray-400 mb-1">
                {r.source_id} &middot; score: {r.score?.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {r.text?.slice(0, 200)}
                {(r.text?.length || 0) > 200 ? '...' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
      {!loading && query && results.length === 0 && (
        <p className="text-xs text-gray-400 mt-4 text-center">无结果</p>
      )}
    </div>
  );
}
