import { Priority } from "@prisma/client";
import { PRIORITY_COLORS } from "@/types";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_COLORS[priority]}`}>
      {priority}
    </span>
  );
}
