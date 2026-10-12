import { useChatStore } from '../../lib/store';
import { PerspectivePanel } from './PerspectivePanel';
import { DocumentPanel } from './DocumentPanel';
import { SearchPanel } from './SearchPanel';
import { InterviewPanel } from './InterviewPanel';

const tabs = [
  { key: 'perspectives' as const, label: '视角' },
  { key: 'documents' as const, label: '文档' },
  { key: 'search' as const, label: '检索' },
  { key: 'interview' as const, label: '访谈' },
];

export function Sidebar() {
  const { sidebarTab, setSidebarTab, setSidebarOpen } = useChatStore();

  return (
    <aside className="w-72 border-r border-border dark:border-border-dark bg-white dark:bg-surface-dark flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
        <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
          HERMENEUT
        </h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          &times;
        </button>
      </div>
      <div className="flex border-b border-border dark:border-border-dark">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSidebarTab(tab.key)}
            className={`flex-1 text-xs py-2 transition-colors ${
              sidebarTab === tab.key
                ? 'text-symbolic border-b-2 border-symbolic font-medium'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'perspectives' && <PerspectivePanel />}
        {sidebarTab === 'documents' && <DocumentPanel />}
        {sidebarTab === 'search' && <SearchPanel />}
        {sidebarTab === 'interview' && <InterviewPanel />}
      </div>
    </aside>
  );
}
