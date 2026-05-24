"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, Upload, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTask, useUpdateTaskProgress } from "@/hooks/useTasks";
import { tasksService } from "@/services/tasks.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatFileSize, cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: task, isLoading } = useTask(id);
  const updateProgress = useUpdateTaskProgress();
  const [progress, setProgress] = useState<number>(task?.progress_percentage ?? 0);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!task) return (
    <div className="flex flex-col items-center gap-3 justify-center h-64 text-muted-foreground">
      <AlertCircle className="w-10 h-10" />
      <p>Task not found.</p>
    </div>
  );

  const isAssignee = user?.id === task.assigned_to;
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const canEdit = isAssignee || isAdmin;

  const handleProgressUpdate = async () => {
    const status = progress === 100 ? "COMPLETED" : "IN_PROGRESS";
    await updateProgress.mutateAsync({ id, progress_percentage: progress, status });
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      await tasksService.uploadDeliverables(id, files);
      setFiles([]);
      toast.success("Deliverables uploaded.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/tasks" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" />
        Back to tasks
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assigned by {task.assigned_by_detail?.full_name ?? "—"} · {formatDate(task.created_at)}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {task.description && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Progress */}
          {canEdit && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-4">Update Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      className={cn("h-full rounded-full", progress === 100 ? "bg-green-500" : "bg-primary")}
                    />
                  </div>
                </div>
                <button
                  onClick={handleProgressUpdate}
                  disabled={updateProgress.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {updateProgress.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Progress
                </button>
              </div>
            </div>
          )}

          {/* Upload deliverables */}
          {canEdit && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-4">Upload Deliverables</h3>
              <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to select files</span>
                <input type="file" multiple className="sr-only" onChange={(e) => {
                  if (e.target.files) setFiles((f) => [...f, ...Array.from(e.target.files!)]);
                }} />
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-2">
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                      <button type="button" onClick={() => setFiles((fl) => fl.filter((_, j) => j !== i))}>
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-500 transition disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload {files.length} file{files.length > 1 ? "s" : ""}
                  </button>
                </div>
              )}

              {/* Existing deliverables */}
              {task.deliverables.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Submitted deliverables</p>
                  <div className="space-y-1.5">
                    {task.deliverables.map((d) => (
                      <div key={d.id} className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950/20 rounded-lg px-3 py-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span className="flex-1 truncate">{d.filename}</span>
                        <a href={d.file} download className="text-xs text-primary hover:underline">Download</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Task Details</h3>
            <MetaRow label="Assigned to" value={task.assigned_to_detail?.full_name} />
            <MetaRow label="Assigned by" value={task.assigned_by_detail?.full_name} />
            <MetaRow label="Deadline" value={formatDate(task.deadline)} />
            <MetaRow label="Progress" value={`${task.progress_percentage}%`} />
            <MetaRow label="Completed" value={task.completed_at ? formatDate(task.completed_at) : "—"} />
          </div>
          {task.request_detail && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold mb-2">Related Request</h3>
              <Link href={`/requests/${task.request}`} className="text-sm text-primary hover:underline">
                [{task.request_detail.request_id}] {task.request_detail.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
