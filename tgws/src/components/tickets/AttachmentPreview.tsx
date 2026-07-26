'use client';

import { useState } from 'react';
import { Download, FileText, Image, File, X, ExternalLink } from 'lucide-react';

interface Attachment {
  id?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  showRemove?: boolean;
}

const fileTypeIcons: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  'image/jpeg': { icon: Image, color: 'text-blue-500' },
  'image/png': { icon: Image, color: 'text-blue-500' },
  'image/gif': { icon: Image, color: 'text-blue-500' },
  'image/webp': { icon: Image, color: 'text-blue-500' },
  'application/pdf': { icon: FileText, color: 'text-red-500' },
  'text/plain': { icon: FileText, color: 'text-gray-500' },
  'text/csv': { icon: FileText, color: 'text-green-500' },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType: string) {
  const config = fileTypeIcons[fileType];
  if (config) {
    const Icon = config.icon;
    return <Icon size={20} className={config.color} />;
  }
  return <File size={20} className="text-gray-400" />;
}

function isImage(fileType: string): boolean {
  return fileType.startsWith('image/');
}

function isPDF(fileType: string): boolean {
  return fileType === 'application/pdf';
}

export default function AttachmentPreview({ attachments, onRemove, showRemove = false }: AttachmentPreviewProps) {
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={attachment.id || index}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg border border-gray-200 dark:border-zinc-600"
          >
            {/* Thumbnail or Icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 shrink-0">
              {isImage(attachment.file_type) ? (
                <img
                  src={attachment.file_url}
                  alt={attachment.file_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                getFileIcon(attachment.file_type)
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {attachment.file_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(attachment.file_size)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isImage(attachment.file_type) || isPDF(attachment.file_type) ? (
                <button
                  onClick={() => setPreviewFile(attachment)}
                  className="p-2 text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg transition-colors"
                  title="Preview"
                >
                  <ExternalLink size={16} />
                </button>
              ) : null}
              <a
                href={attachment.file_url}
                download={attachment.file_name}
                className="p-2 text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={16} />
              </a>
              {showRemove && onRemove && attachment.id && (
                <button
                  onClick={() => onRemove(attachment.id!)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                {getFileIcon(previewFile.file_type)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{previewFile.file_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(previewFile.file_size)}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {isImage(previewFile.file_type) ? (
                <img
                  src={previewFile.file_url}
                  alt={previewFile.file_name}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              ) : isPDF(previewFile.file_type) ? (
                <iframe
                  src={previewFile.file_url}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title={previewFile.file_name}
                />
              ) : (
                <div className="text-center py-12">
                  <File size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Preview not available for this file type</p>
                  <a
                    href={previewFile.file_url}
                    download={previewFile.file_name}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B8E6] transition-colors"
                  >
                    <Download size={16} />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}