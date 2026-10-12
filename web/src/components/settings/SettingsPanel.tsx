import { useState, useEffect } from 'react';

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState('');
  const [dataDir, setDataDir] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const isTauri = '__TAURI__' in window;

  useEffect(() => {
    // Load saved API key from localStorage
    const saved = localStorage.getItem('hermeneut_dashscope_key');
    if (saved) setApiKey(saved);

    // Get data directory
    if (isTauri) {
      invoke('get_data_dir').then(setDataDir).catch(console.error);
    } else {
      setDataDir('Browser mode (data stored in backend)');
    }
  }, [isTauri]);

  const invoke = async (cmd: string, args?: Record<string, unknown>) => {
    if (!isTauri) return null;
    return (window as any).__TAURI__.invoke(cmd, args);
  };

  const handleSave = async () => {
    localStorage.setItem('hermeneut_dashscope_key', apiKey);
    if (isTauri) {
      await invoke('set_api_key', { key: apiKey });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Settings
      </h2>

      {/* API Key */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          DashScope API Key
        </label>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-symbolic/50 focus:border-transparent"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Required for LLM analysis. Get your key from Alibaba Cloud DashScope.
        </p>
      </div>

      {/* Data Directory */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Data Directory
        </label>
        <div className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-mono">
          {dataDir || 'Loading...'}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!apiKey.trim()}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-symbolic rounded-lg hover:bg-symbolic/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </button>

      {/* Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isTauri
            ? 'Desktop mode: Data stored locally in app data directory.'
            : 'Browser mode: Data stored in backend server.'}
        </p>
      </div>
    </div>
  );
}
