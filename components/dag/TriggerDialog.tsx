"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface TriggerDialogProps {
  dagId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TriggerDialog({ dagId, isOpen, onClose, onSuccess }: TriggerDialogProps) {
  const [conf, setConf] = useState("{}");
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTrigger = async () => {
    if (!dagId) return;
    
    setIsTriggering(true);
    try {
      let parsedConf = {};
      try {
        parsedConf = JSON.parse(conf);
      } catch (e) {
        toast.error("Invalid JSON configuration");
        setIsTriggering(false);
        return;
      }

      await axios.post(`/api/dags/${dagId}/trigger`, { conf: parsedConf });
      toast.success(`DAG ${dagId} triggered successfully`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(`Failed to trigger DAG ${dagId}`);
      console.error(error);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Trigger DAG: {dagId}
          </DialogTitle>
          <DialogDescription>
            You can optionally provide a JSON configuration for this DAG run.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Configuration (JSON)</label>
            <Textarea
              placeholder='{"key": "value"}'
              className="font-mono text-xs min-h-[150px]"
              value={conf}
              onChange={(e) => setConf(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isTriggering}>
            Cancel
          </Button>
          <Button onClick={handleTrigger} disabled={isTriggering}>
            {isTriggering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Triggering...
              </>
            ) : (
              "Trigger Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
