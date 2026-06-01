"use client";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications, useMarkAllRead, useMarkRead } from "@/hooks/useNotifications";
import { PageHeader } from "@/components/common/PageHeader";
import { formatDateTime, cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.results ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Bell className="w-12 h-12 opacity-30" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "flex items-start gap-4 p-4 hover:bg-muted/30 transition",
                !notif.is_read && "bg-primary/5"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full mt-2 shrink-0",
                notif.is_read ? "bg-muted-foreground/30" : "bg-primary"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", !notif.is_read && "text-foreground font-semibold")}>
                  {notif.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{formatDateTime(notif.created_at)}</p>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => markRead.mutate(notif.id)}
                  className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
