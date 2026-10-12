import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useChatStore } from '../../lib/store';

interface InterviewSession {
  session_id: string;
  state: string;
  current_question?: {
    id: string;
    text: string;
    module: string;
  };
  answered_count: number;
  total_questions: number;
}

export function InterviewPanel() {
  const { addMessage, setInterviewSessionId, setInterviewQuestionId, setMode } = useChatStore();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<InterviewSession>('/api/v1/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'default',
          participant_id: 'anonymous',
        }),
      });
      setSession(res);
      setInterviewSessionId(res.session_id);
      if (res.current_question) {
        setInterviewQuestionId(res.current_question.id);
        addMessage({
          role: 'assistant',
          content: `我们来开始一次访谈。\n\n> **问题** · ${res.current_question.module}\n>\n> ${res.current_question.text}\n\n请在下方输入你的回答。`,
        });
      }
      setMode('interview');
    } catch (err) {
      addMessage({
        role: 'assistant',
        content: `启动访谈失败: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = async () => {
    if (!session) return;
    try {
      await apiFetch(`/api/v1/interviews/${session.session_id}/reset`, { method: 'POST' });
      setSession(null);
      setInterviewSessionId(null);
      setInterviewQuestionId(null);
    } catch { /* ignore */ }
  };

  return (
    <div className="p-4">
      {!session ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-3 text-gray-300">&#9993;</div>
          <p className="text-xs text-gray-500 mb-4">
            开始结构化访谈，系统将引导你完成一系列问题。
          </p>
          <button
            onClick={startInterview}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-symbolic text-white text-sm font-medium disabled:opacity-50 hover:bg-symbolic/90 transition-colors"
          >
            {loading ? '启动中...' : '开始访谈'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              访谈进行中
            </span>
            <span className="text-xs text-gray-400">
              {session.answered_count}/{session.total_questions}
            </span>
          </div>
          <div className="mb-3">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-symbolic rounded-full transition-all"
                style={{ width: `${(session.answered_count / Math.max(session.total_questions, 1)) * 100}%` }}
              />
            </div>
          </div>
          {session.current_question && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 mb-3">
              <div className="text-xs text-symbolic font-medium mb-1">
                {session.current_question.module}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {session.current_question.text}
              </p>
            </div>
          )}
          <div className="text-xs text-gray-400 mb-3">
            在聊天框中输入回答，系统会自动提交。
          </div>
          <button
            onClick={resetInterview}
            className="w-full text-xs py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
          >
            重置访谈
          </button>
        </div>
      )}
    </div>
  );
}
