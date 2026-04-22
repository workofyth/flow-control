import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DagStatusBadgeProps {
  status: string;
  className?: string;
}

export function DagStatusBadge({ status, className }: DagStatusBadgeProps) {
  const normalizedStatus = (status || "unknown").toLowerCase();

  const variants: Record<string, { label: string; className: string }> = {
    success: { 
      label: "Success", 
      className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" 
    },
    running: { 
      label: "Running", 
      className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 animate-pulse" 
    },
    failed: { 
      label: "Failed", 
      className: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20" 
    },
    queued: { 
      label: "Queued", 
      className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20" 
    },
    paused: { 
      label: "Paused", 
      className: "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-500/20" 
    },
    active: { 
      label: "Active", 
      className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" 
    },
  };

  const config = variants[normalizedStatus] || { 
    label: status || "Unknown", 
    className: "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200" 
  };

  return (
    <Badge variant="outline" className={cn("font-medium transition-colors", config.className, className)}>
      {config.label}
    </Badge>
  );
}
