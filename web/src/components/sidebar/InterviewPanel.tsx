import { useState } from 'react';
import { apiFetch, ensureProject, ensureParticipant } from '../../lib/api';
import { useChatStore } from '../../lib/store';

interface InterviewQuestion {
  id: string;
  text: string;
  kind: string;
  module_id: string;
  module_title: string;
  context_hint: string;
}

interface InterviewSessionData {
  id: string;
  state: string;
  current_question: InterviewQuestion | null;
  progress: {
    completed_primary: number;
    total_primary: number;
    required_remaining: number;
  };
}

interface CreateInterviewResponse {
  session: InterviewSessionData;
  config: Record<string, unknown>;
}

export function InterviewPanel() {
  const { addMessage, setInterviewSessionId, setInterviewQuestionId, setMode } = useChatStore();
  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const mono = { fontFamily: 'var(--font-mono)' };

  const startInterview = async () => {
    setLoading(true);
    try {
      await ensureProject('default');
      await ensureParticipant('anonymous', 'default');
      const res = await apiFetch<CreateInterviewResponse>('/api/v1/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'default',
          participant_id: 'anonymous',
        }),
      });
      const s = res.session;
      setSession(s);
      setInterviewSessionId(s.id);
      if (s.current_question) {
        setInterviewQuestionId(s.current_question.id);
        addMessage({
          role: 'assistant',
          content: `我们来开始一次访谈。\n\n> **问题** · ${s.current_question.module_title}\n>\n> ${s.current_question.text}\n\n请在下方输入你的回答。`,
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
      await apiFetch(`/api/v1/interviews/${session.id}/reset`, { method: 'POST' });
      setSession(null);
      setInterviewSessionId(null);
      setInterviewQuestionId(null);
    } catch (e) { console.warn('Failed to reset interview:', e); }
  };

  const completed = session?.progress.completed_primary ?? 0;
  const total = session?.progress.total_primary ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-4">
      {!session ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-3 text-muted/30">&#9993;</div>
          <p className="text-xs text-muted mb-4" style={mono}>
            STRUCTURED INTERVIEW SESSION
          </p>
          <button
            onClick={startInterview}
            disabled={loading}
            className="px-4 py-1.5 text-xs border border-ink dark:border-ink-dark bg-transparent text-ink dark:text-ink-dark hover:bg-ink hover:text-ink-dark disabled:opacity-30 transition-colors"
            style={mono}
          >
            {loading ? 'STARTING...' : 'START INTERVIEW'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted tracking-wider" style={mono}>
              INTERVIEW ACTIVE
            </span>
            <span className="text-[10px] text-muted" style={mono}>
              {completed}/{total}
            </span>
          </div>
          <div className="mb-3 h-[2px] bg-border dark:bg-border-dark">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {session.current_question && (
            <div className="border-l-2 border-accent/40 pl-3 mb-3">
              <div className="text-[10px] text-muted tracking-wider mb-1" style={mono}>
                {session.current_question.module_title}
              </div>
              <p className="text-sm text-ink-soft dark:text-ink-soft-dark leading-relaxed" style={{ fontFamily: 'var(--font-zh)' }}>
                {session.current_question.text}
              </p>
            </div>
          )}
          <div className="text-[10px] text-muted/60 mb-3" style={mono}>
            TYPE YOUR ANSWER BELOW
          </div>
          <button
            onClick={resetInterview}
            className="w-full text-[10px] py-1.5 border border-border dark:border-border-dark text-muted hover:text-accent hover:border-accent transition-colors"
            style={mono}
          >
            RESET
          </button>
        </div>
      )}
    </div>
  );
}
