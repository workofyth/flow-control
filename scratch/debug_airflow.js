
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const AIRFLOW_BASE_URL = env.AIRFLOW_BASE_URL;
const AIRFLOW_USERNAME = env.AIRFLOW_USERNAME;
const AIRFLOW_PASSWORD = env.AIRFLOW_PASSWORD;

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
      first_run_dag: resp.data.dag_runs?.[0]?.dag_id,
      states: resp.data.dag_runs?.map(r => r.state)
    });
  } catch (e) {
    console.error('Error:', e.message);
    if (e.response) {
      console.error('Response data:', e.response.data);
    }
  }
}

test();
