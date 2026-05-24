import { cn, getPriorityColor } from "@/lib/utils";
import { RequestPriority } from "@/types";

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", getPriorityColor(priority))}>
      {priority}
    </span>
  );
}
