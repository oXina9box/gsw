'use client';

import { useState, useRef, type ReactNode } from 'react';

interface FlowbiteFileUploadProps {
  id?: string;
  name?: string;
  label?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: FileList | null) => void;
  icon?: ReactNode;
  className?: string;
}

export function FlowbiteFileUpload({
  id = 'file-upload',
  name = 'file',
  label = 'Upload file',
  helperText = 'SVG, PNG, JPG, MP4 or WebM (MAX. 50MB)',
  accept,
  multiple = false,
  onFilesSelected,
  icon,
  className = '',
}: FlowbiteFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const names: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const item = files.item(i);
        if (item) names.push(item.name);
      }
      setSelectedFileNames(names);
      onFilesSelected?.(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block font-mono text-xs text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-150 ${
          dragActive
            ? 'border-cyan bg-cyan/10'
            : 'border-border hover:border-cyan bg-surface hover:bg-surface-2'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          {icon ? (
            <div className="text-text-muted text-2xl mb-1">{icon}</div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-cyan mb-1">
              ↑
            </div>
          )}

          <p className="text-sm font-body text-text">
            <span className="font-semibold text-cyan">Click to upload</span> or drag and drop
          </p>

          <p className="text-xs font-mono text-text-faint">
            {helperText}
          </p>
        </div>

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {selectedFileNames.length > 0 && (
        <div className="p-3 border border-border bg-surface-2 rounded-sm space-y-1 text-xs font-mono text-text-muted">
          <p className="text-text font-semibold uppercase tracking-wider">Selected:</p>
          <ul className="space-y-0.5">
            {selectedFileNames.map((name, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-lime">✓</span>
                <span className="truncate">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
