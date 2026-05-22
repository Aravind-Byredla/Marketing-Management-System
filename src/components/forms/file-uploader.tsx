"use client";

import { useState, useRef } from "react";
import { formatFileSize } from "@/lib/utils";

interface Props {
  requestId: string;
  onUploaded?: (files: any[]) => void;
}

export function FileUploader({ requestId, onUploaded }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("requestId", requestId);
    files.forEach(f => form.append("files", f));

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      const saved = await res.json();
      setDone(true);
      setFiles([]);
      onUploaded?.(saved);
    } else {
      setError("Upload failed. Check file types and sizes.");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
      >
        <p className="text-2xl mb-2">📎</p>
        <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">Images, PDFs, Videos · Max 10MB each</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleSelect}
          accept="image/*,application/pdf,video/mp4" />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{f.type.startsWith("image/") ? "🖼️" : f.type === "application/pdf" ? "📄" : "🎬"}</span>
                <span className="text-sm text-gray-700 truncate">{f.name}</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-2">{formatFileSize(f.size)}</span>
            </div>
          ))}
          <button onClick={handleUpload} disabled={uploading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {uploading ? "Uploading..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {done && (
        <p className="text-sm text-green-600 text-center">✅ Files uploaded successfully!</p>
      )}
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
