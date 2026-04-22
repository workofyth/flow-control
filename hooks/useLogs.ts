import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useLogs(dagId: string, runId: string, taskId: string, tryNumber: number) {
  return useQuery({
    queryKey: ["logs", dagId, runId, taskId, tryNumber],
    queryFn: async () => {
      if (!dagId || !runId || !taskId) return "";
      const response = await axios.get("/api/logs", {
        params: { dagId, runId, taskId, tryNumber },
        headers: { 'Accept': 'text/plain' }
      });
      return response.data;
    },
    enabled: !!dagId && !!runId && !!taskId,
    refetchInterval: (query) => {
      // If log is short or seems to be in progress, refetch
      return 5000;
    }
  });
}
