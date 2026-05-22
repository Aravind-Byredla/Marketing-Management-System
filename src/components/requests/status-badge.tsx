import { RequestStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
