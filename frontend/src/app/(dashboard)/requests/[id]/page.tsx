"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Download, Loader2, MessageSquare,
  Paperclip, Send, User, AlertCircle, CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRequest, useTransitionRequest, useAddComment } from "@/hooks/useRequests";
import { useCreateTask } from "@/hooks/useTasks";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { formatDate, formatDateTime, formatFileSize, humanizeStatus } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { RequestStatus } from "@/types";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: request, isLoading } = useRequest(id);
  const transitionRequest = useTransitionRequest();
  const addComment = useAddComment();
  const [comment, setComment] = useState("");
  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "attachments" | "comments">("overview");

  const handleTransition = async (status: string) => {
    setTransitioning(status);
    await transitionRequest.mutateAsync({ id, status });
    setTransitioning(null);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    await addComment.mutateAsync({ requestId: id, message: comment });
    setComment("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertCircle className="w-10 h-10" />
        <p>Request not found.</p>
        <Link href="/requests" className="text-primary hover:underline text-sm">Back to requests</Link>
      </div>
    );
  }

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back & Header */}
      <div>
        <Link href="/requests" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to requests
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm text-muted-foreground">{request.request_id}</span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{request.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submitted by {request.created_by_detail.full_name} · {formatDateTime(request.created_at)}
            </p>
          </div>
          {/* Workflow Transitions */}
          {isAdmin && request.allowed_transitions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {request.allowed_transitions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleTransition(s)}
                  disabled={transitioning === s}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border transition",
                    s === "COMPLETED" || s === "CLOSED"
                      ? "bg-green-600 border-green-600 text-white hover:bg-green-500"
                      : s === "REJECTED"
                      ? "bg-red-600 border-red-600 text-white hover:bg-red-500"
                      : "bg-primary border-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {transitioning === s ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  → {humanizeStatus(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
            {(["overview", "attachments", "comments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition capitalize",
                  activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {tab === "attachments" && request.attachments.length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {request.attachments.length}
                  </span>
                )}
                {tab === "comments" && request.comments.length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {request.comments.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
              <Section title="Objective">{request.objective}</Section>
              <Section title="Summary">{request.summary}</Section>
              {request.notes && <Section title="Notes">{request.notes}</Section>}
              {request.video_references.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Video References</h3>
                  <ul className="space-y-1">
                    {request.video_references.map((url, i) => (
                      <li key={i}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "attachments" && (
            <motion.div key="attachments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
              {request.attachments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No attachments uploaded.</p>
              ) : (
                <div className="space-y-2">
                  {request.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.filename}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(att.file_size)}</p>
                      </div>
                      <a
                        href={att.file}
                        download
                        className="p-1.5 hover:bg-accent rounded-lg transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "comments" && (
            <motion.div key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
              {request.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {c.user_detail.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{c.user_detail.full_name}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{c.message}</p>
                  </div>
                </div>
              ))}
              {request.comments.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">No comments yet. Be the first to comment.</p>
              )}
              {/* Comment input */}
              <div className="flex gap-3 pt-3 border-t border-border">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {user?.full_name?.charAt(0)}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleComment())}
                    placeholder="Write a comment…"
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim() || addComment.isPending}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Meta */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Request Details</h3>
            <MetaRow label="Company" value={request.company_detail.name} />
            <MetaRow label="Branch" value={request.branch_detail.name} />
            <MetaRow label="Department" value={request.department_detail?.name} />
            <MetaRow label="Category" value={request.category_detail.name} />
            <MetaRow label="Quantity" value={String(request.quantity)} />
            <MetaRow label="Deadline" value={formatDate(request.deadline)} icon={<Calendar className="w-3.5 h-3.5" />} />
            {request.approved_by_detail && (
              <MetaRow label="Approved By" value={request.approved_by_detail.full_name} icon={<CheckCircle className="w-3.5 h-3.5 text-green-500" />} />
            )}
          </div>

          {/* Assignee */}
          {request.created_by_detail && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Created By</h3>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                  {request.created_by_detail.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{request.created_by_detail.full_name}</p>
                  <p className="text-xs text-muted-foreground">{request.created_by_detail.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function MetaRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right flex items-center gap-1">
        {icon}{value ?? "—"}
      </span>
    </div>
  );
}
