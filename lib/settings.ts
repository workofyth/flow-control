import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

export interface AirflowSettings {
  baseUrl: string;
  username: string;
  password?: string;
  isConfigured: boolean;
}

const DEFAULT_SETTINGS: AirflowSettings = {
  baseUrl: process.env.AIRFLOW_BASE_URL || '',
  username: process.env.AIRFLOW_USERNAME || 'admin',
  password: process.env.AIRFLOW_PASSWORD || 'admin',
  isConfigured: !!process.env.AIRFLOW_BASE_URL
};

export function getAirflowSettings(): AirflowSettings {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      // Ensure data directory exists
      const dataDir = path.dirname(SETTINGS_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    
    const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveAirflowSettings(settings: Partial<AirflowSettings>): AirflowSettings {
  const current = getAirflowSettings();
  const updated = { 
    ...current, 
    ...settings, 
    isConfigured: true 
  };
  
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2));
  return updated;
}
