export interface Dag {
  dag_id: string;
  description: string | null;
  is_paused: boolean;
  is_active: boolean;
  last_pickled: string | null;
  last_expired: string | null;
  scheduler_type: string | null;
  pickle_id: number | null;
  default_view: string | null;
  fileloc: string;
  file_token: string;
  owners: string[];
  tags: { name: string }[];
  next_dagrun: string | null;
  next_dagrun_data_interval_start: string | null;
  next_dagrun_data_interval_end: string | null;
  last_run_state?: string;
  last_run_execution_date?: string;
}

export interface DagCollection {
  dags: Dag[];
  total_entries: number;
}

export interface DagRun {
  dag_id: string;
  dag_run_id: string;
  execution_date: string;
  logical_date: string;
  start_date: string | null;
  end_date: string | null;
  state: 'success' | 'running' | 'failed' | 'queued' | 'queued' | 'restarting';
  external_trigger: boolean;
  conf: any;
  data_interval_start: string | null;
  data_interval_end: string | null;
  last_scheduling_decision: string | null;
  run_type: string;
}

export interface DagRunCollection {
  dag_runs: DagRun[];
  total_entries: number;
}

export interface TaskInstance {
  dag_id: string;
  dag_run_id: string;
  task_id: string;
  execution_date: string;
  start_date: string | null;
  end_date: string | null;
  duration: number | null;
  state: 'success' | 'running' | 'failed' | 'upstream_failed' | 'skipped' | 'queued' | 'scheduled' | 'deferred' | 'removed' | 'restarting' | 'none';
  try_number: number;
  max_tries: number;
  hostname: string;
  unixname: string;
  pool: string;
  pool_slots: number;
  queue: string;
  priority_weight: number;
  operator: string;
  queued_when: string | null;
  pid: number | null;
  executor_config: string;
}

export interface TaskInstanceCollection {
  task_instances: TaskInstance[];
  total_entries: number;
}
