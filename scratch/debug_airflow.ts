
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const AIRFLOW_BASE_URL = process.env.AIRFLOW_BASE_URL;
const AIRFLOW_USERNAME = process.env.AIRFLOW_USERNAME;
const AIRFLOW_PASSWORD = process.env.AIRFLOW_PASSWORD;

async function test() {
  const auth = {
    username: AIRFLOW_USERNAME || 'admin',
    password: AIRFLOW_PASSWORD || 'admin',
  };

  const client = axios.create({
    baseURL: `${AIRFLOW_BASE_URL}/api/v1`,
    auth: auth,
  });

  try {
    console.log('Testing connection to:', `${AIRFLOW_BASE_URL}/api/v1/dags/~/dagRuns`);
    const resp = await client.get('/dags/~/dagRuns', { params: { limit: 10 } });
    console.log('Status:', resp.status);
    console.log('Data summary:', {
      total_entries: resp.data.total_entries,
      runs_count: resp.data.dag_runs?.length,
      first_run: resp.data.dag_runs?.[0]?.dag_id
    });
  } catch (e: any) {
    console.error('Error:', e.message);
    if (e.response) {
      console.error('Response data:', e.response.data);
    }
  }
}

test();
