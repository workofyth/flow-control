import axios from 'axios';

import { getAirflowSettings } from './settings';

export const getAirflowClient = () => {
  const settings = getAirflowSettings();
  
  return axios.create({
    baseURL: `${settings.baseUrl}/api/v1`,
    auth: {
      username: settings.username,
      password: settings.password || '',
    },
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
};

// Helper functions for common Airflow API calls
export const airflowApi = {
  getDags: async (limit = 100, offset = 0, pattern?: string) => {
    const client = getAirflowClient();
    const params: any = { limit, offset };
    if (pattern) params.dag_id_pattern = pattern;
    const response = await client.get('/dags', { params });
    return response.data;
  },

  getAllDags: async () => {
    let allDags: any[] = [];
    let offset = 0;
    const limit = 100;
    let total = 0;
    
    // Fetch first page
    const data = await airflowApi.getDags(limit, offset);
    allDags = [...data.dags];
    total = data.total_entries;
    
    // Fetch subsequent pages if needed
    while (allDags.length < total) {
      offset += limit;
      const nextData = await airflowApi.getDags(limit, offset);
      allDags = [...allDags, ...nextData.dags];
      // Safety break in case of unexpected API behavior
      if (nextData.dags.length === 0) break;
    }
    
    return { dags: allDags, total_entries: total };
  },
  
  getDag: async (dagId: string) => {
    const client = getAirflowClient();
    const response = await client.get(`/dags/${dagId}`);
    return response.data;
  },
  
  updateDag: async (dagId: string, data: { is_paused: boolean }) => {
    const client = getAirflowClient();
    const response = await client.patch(`/dags/${dagId}`, data);
    return response.data;
  },
  
  triggerDag: async (dagId: string, conf: any = {}) => {
    const client = getAirflowClient();
    const response = await client.post(`/dags/${dagId}/dagRuns`, { conf });
    return response.data;
  },
  
  getDagRuns: async (dagId: string, limit = 100, offset = 0) => {
    const client = getAirflowClient();
    const response = await client.get(`/dags/${dagId}/dagRuns`, { 
      params: { limit, offset, order_by: '-execution_date' } 
    });
    return response.data;
  },
  
  getDagRun: async (dagId: string, dagRunId: string) => {
    const client = getAirflowClient();
    const response = await client.get(`/dags/${dagId}/dagRuns/${dagRunId}`);
    return response.data;
  },
  
  getTaskInstances: async (dagId: string, dagRunId: string) => {
    const client = getAirflowClient();
    const response = await client.get(`/dags/${dagId}/dagRuns/${dagRunId}/taskInstances`);
    return response.data;
  },
  
  getTaskLog: async (dagId: string, dagRunId: string, taskId: string, tryNumber: number) => {
    const client = getAirflowClient();
    const response = await client.get(`/dags/${dagId}/dagRuns/${dagRunId}/taskInstances/${taskId}/logs/${tryNumber}`, {
      headers: { 'Accept': 'text/plain' }
    });
    return response.data;
  },

  getDagTasks: async (dagId: string) => {
    const client = getAirflowClient();
    const response = await client.get(`/dags/${dagId}/tasks`);
    return response.data;
  },

  getGlobalDagRuns: async (limit = 100, state?: string) => {
    const client = getAirflowClient();
    const params: any = { limit, order_by: '-start_date' };
    if (state) params.state = [state]; 
    const response = await client.get('/dags/~/dagRuns', { params });
    return response.data;
  }
};
