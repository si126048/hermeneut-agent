import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useChatStore } from '../../lib/store';
import { apiStream, apiUpload, apiFetch } from '../../lib/api';
import type { AnalysisCard } from '../../lib/store';

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function ChatInput() {
  const {
    addMessage, updateMessage, addCardToMessage, appendToMessage,
    setStreaming, isStreaming, setPhase,
    mode, setMode,
    interviewSessionId, setInterviewSessionId,
    interviewQuestionId, setInterviewQuestionId,
    messages,
  } = useChatStore();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: { 'text/plain': ['.txt', '.md'], 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = Array.from(e.target.files || []);
    if (accepted.length > 0) setFiles((prev) => [...prev, ...accepted]);
    e.target.value = '';
  };

  const placeholder = mode === 'chat'
    ? '输入消息开始对话...'
    : mode === 'interview'
      ? interviewSessionId
        ? '输入你的回答...'
        : '先在侧边栏「访谈」面板开始访谈'
      : mode === 'dialectical'
        ? '输入文本进行辩证分析...'
        : '输入文本进行分析...';

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    if (isStreaming) return;

    const attachmentNames = files.map((f) => f.name);
    addMessage({
      role: 'user',
      content: trimmed,
      attachments: attachmentNames.length > 0 ? attachmentNames : undefined,
    });

    setText('');
    setFiles([]);

    const assistantId = addMessage({ role: 'assistant', content: '', streaming: true });
    setStreaming(true);
    setPhase(0);

    try {
      if (mode === 'chat') {
        const chatHistory = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .slice(-20)
          .map(m => ({ role: m.role, content: m.content }));
        chatHistory.push({ role: 'user', content: trimmed });

        await apiStream('/api/v1/chat/completions', { messages: chatHistory }, (event, data) => {
          const d = data as Record<string, unknown>;
          switch (event) {
            case 'text':
              appendToMessage(assistantId, d.chunk as string);
              break;
            case 'done':
              updateMessage(assistantId, { streaming: false });
              break;
            case 'error':
              updateMessage(assistantId, {
                content: `Error: ${d.message || 'Unknown error'}`,
                streaming: false,
              });
              break;
          }
        });
        setStreaming(false);
        useChatStore.getState().saveMessages();
        return;
      }

      if (mode === 'interview' && interviewSessionId) {
        const res = await apiFetch<Record<string, unknown>>(
          `/api/v1/interviews/${interviewSessionId}/turns`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: 'default',
              participant_id: 'anonymous',
              question_id: interviewQuestionId || '',
              answer_text: trimmed,
            }),
          },
        );

        const state = res.state as string;
        const currentQ = res.current_question as { id?: string; text?: string; module_title?: string; kind?: string } | null;

        if (state === 'completed' || !currentQ) {
          updateMessage(assistantId, { streaming: false });
          addMessage({
            role: 'assistant',
            content: '访谈已完成，感谢你的参与。你可以在侧边栏重置并开始新的访谈，或者切换回「对话」模式继续交流。',
          });
          setInterviewSessionId(null);
          setInterviewQuestionId(null);
          setMode('chat');
        } else {
          setInterviewQuestionId(currentQ.id || null);
          const kindLabel = currentQ.kind === 'followup' ? '追问' : '问题';
          const moduleTitle = currentQ.module_title || '';
          const transition = currentQ.kind === 'followup'
            ? '我想再追问一下——'
            : '好的，接下来——';
          updateMessage(assistantId, {
            streaming: false,
            content: `${transition}\n\n> **${kindLabel}**${moduleTitle ? ` · ${moduleTitle}` : ''}\n>\n> ${currentQ.text}`,
          });
        }
        setStreaming(false);
        useChatStore.getState().saveMessages();
        return;
      }

      let sourceIds: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const result = await apiUpload('/api/v1/theory/sources', file, { project_id: 'default' }) as { id?: string };
          if (result.id) sourceIds.push(result.id);
        }
      }

      const endpoint = mode === 'dialectical' ? '/api/v1/chat/dialectical' : '/api/v1/chat/analyze';
      await apiStream(endpoint, { text: trimmed, source_ids: sourceIds, mode }, (event, data) => {
        const d = data as Record<string, unknown>;
        switch (event) {
          case 'stage':
            setPhase((d.phase as number) || 0);
            updateMessage(assistantId, {
              content: `**${d.label || d.name}**...\n\n`,
            });
            break;
          case 'observation':
          case 'hypothesis':
          case 'counterexample':
          case 'synthesis':
            addCardToMessage(assistantId, {
              variant: event as AnalysisCard['variant'],
              tag: (d.id as string) || '',
              content: (d.label as string) || (d.text as string) || '',
              register: d.register as 'S' | 'I' | 'R' | undefined,
              meta: d.meta as Record<string, string> | undefined,
            });
            break;
          case 'text':
            updateMessage(assistantId, {
              content: (useChatStore.getState().messages.find((m) => m.id === assistantId)?.content || '') + (d.chunk as string),
            });
            break;
          case 'complete':
            updateMessage(assistantId, { streaming: false });
            break;
          case 'error':
            updateMessage(assistantId, {
              content: `Error: ${d.message || 'Unknown error'}`,
              streaming: false,
            });
            break;
        }
      });
    } catch (err) {
      updateMessage(assistantId, {
        content: `Error: ${err instanceof Error ? err.message : 'Request failed'}`,
        streaming: false,
      });
    } finally {
      setStreaming(false);
      useChatStore.getState().saveMessages();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const modes = [
    { key: 'chat' as const, label: '对话' },
    { key: 'analysis' as const, label: '分析' },
    { key: 'dialectical' as const, label: '辩证' },
    { key: 'interview' as const, label: '访谈' },
  ];

  return (
    <div className="border-t border-border dark:border-border-dark bg-white dark:bg-surface-dark">
      {files.length > 0 && (
        <div className="px-4 pt-2 flex gap-2 flex-wrap">
          {files.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {f.name}
              <button
                onClick={() => removeFile(i)}
                className="ml-1 hover:text-red-500"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <div
        {...getRootProps()}
        className={`px-4 py-3 ${isDragActive ? 'bg-accent/5 ring-2 ring-symbolic/30 ring-inset' : ''}`}
      >
        <input {...getInputProps()} />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="flex gap-1 mb-2">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                mode === m.key
                  ? 'bg-symbolic text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 min-w-0 resize-none bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 min-h-[36px] max-h-32"
            style={{ height: 'auto', overflow: 'hidden' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={openFilePicker}
            title="上传文件"
            className="p-2 rounded-lg text-gray-400 hover:text-symbolic hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <PaperclipIcon />
          </button>
          <button
            onClick={handleSend}
            disabled={isStreaming || (!text.trim() && files.length === 0)}
            className="px-3 py-1.5 rounded-lg bg-symbolic text-white text-sm font-medium disabled:opacity-30 hover:bg-symbolic/90 transition-colors"
          >
            {isStreaming ? '...' : '发送'}
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-400">
          Ctrl+Enter 发送 &middot; 拖拽或点击附件图标上传文件
        </div>
      </div>
    </div>
  );
}
