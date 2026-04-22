import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useRunDetail(dagId: string, runId: string) {
  return useQuery({
    queryKey: ["run", dagId, runId],
    queryFn: async () => {
      const response = await axios.get(`/api/dags/${dagId}/runs/${runId}`);
      return response.data;
    },
    enabled: !!dagId && !!runId,
  });
}

export function useTaskInstances(dagId: string, runId: string) {
  return useQuery({
    queryKey: ["task-instances", dagId, runId],
    queryFn: async () => {
      const response = await axios.get(`/api/dags/${dagId}/runs/${runId}/tasks`);
      return response.data;
    },
    enabled: !!dagId && !!runId,
    refetchInterval: (query) => {
      // If any task is still running, poll more frequently
      const data: any = query.state.data;
      const hasRunning = data?.task_instances?.some((ti: any) => 
        ["running", "queued", "scheduled", "deferred", "restarting"].includes(ti.state)
      );
      return hasRunning ? 5000 : 30000;
    }
  });
}
