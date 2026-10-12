import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiUpload } from '../../lib/api';

interface DocItem {
  name: string;
  size: number;
  status: 'uploading' | 'done' | 'error';
}

export function DocumentPanel() {
  const [docs, setDocs] = useState<DocItem[]>([]);

  const onDrop = useCallback(async (accepted: File[]) => {
    for (const file of accepted) {
      setDocs((prev) => [...prev, { name: file.name, size: file.size, status: 'uploading' }]);
      try {
        await apiUpload('/api/v1/theory/sources', file, { project_id: 'default' });
        setDocs((prev) =>
          prev.map((d) => (d.name === file.name ? { ...d, status: 'done' } : d))
        );
      } catch {
        setDocs((prev) =>
          prev.map((d) => (d.name === file.name ? { ...d, status: 'error' } : d))
        );
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt', '.md'], 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-symbolic bg-symbolic/5'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-2xl mb-2 text-gray-300">&#8593;</div>
        <p className="text-xs text-gray-500">
          拖拽文件到此处，或点击上传
        </p>
        <p className="text-xs text-gray-400 mt-1">
          .txt .md .pdf (max 10MB)
        </p>
      </div>
      {docs.length > 0 && (
        <div className="mt-4 space-y-2">
          {docs.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs px-3 py-2 rounded bg-gray-50 dark:bg-gray-800/50"
            >
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                {d.name}
              </span>
              <span
                className={`ml-2 ${
                  d.status === 'done'
                    ? 'text-green-500'
                    : d.status === 'error'
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}
              >
                {d.status === 'uploading' ? '...' : d.status === 'done' ? '\u2713' : '\u2717'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
