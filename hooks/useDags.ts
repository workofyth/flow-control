import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DagCollection } from "@/types/airflow";

export function useDags(options: { search?: string; limit?: number; offset?: number; interval?: number } = {}) {
  const { search, limit = 100, offset = 0, interval = 30000 } = options;

  return useQuery<DagCollection>({
    queryKey: ["dags", search, limit, offset],
    queryFn: async () => {
      const response = await axios.get("/api/dags", {
        params: { search, limit, offset },
      });
      return response.data;
    },
    refetchInterval: interval,
  });
}
