import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useDagDetail(dagId: string) {
  return useQuery({
    queryKey: ["dag", dagId],
    queryFn: async () => {
      const response = await axios.get(`/api/dags/${dagId}`);
      return response.data;
    },
    enabled: !!dagId,
  });
}

export function useDagRuns(dagId: string) {
  return useQuery({
    queryKey: ["dag-runs", dagId],
    queryFn: async () => {
      const response = await axios.get(`/api/dags/${dagId}/runs`);
      return response.data;
    },
    enabled: !!dagId,
    refetchInterval: 10000,
  });
}
