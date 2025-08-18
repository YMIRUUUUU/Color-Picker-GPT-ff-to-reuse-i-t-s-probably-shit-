export type SyncConfig = {
  endpointUrl: string; // Your backend endpoint to sync with
  apiKey?: string;
};

const KEY = 'pm_cloud_sync_cfg_v1';

export function loadSyncConfig(): SyncConfig | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function saveSyncConfig(cfg: SyncConfig | null): void {
  try {
    if (cfg) localStorage.setItem(KEY, JSON.stringify(cfg)); else localStorage.removeItem(KEY);
  } catch {}
}

export async function pushToCloud(data: any, cfg: SyncConfig): Promise<boolean> {
  try {
    const res = await fetch(cfg.endpointUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}) },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch { return false; }
}

export async function pullFromCloud(cfg: SyncConfig): Promise<any | null> {
  try {
    const res = await fetch(cfg.endpointUrl, { headers: { ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}) } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

