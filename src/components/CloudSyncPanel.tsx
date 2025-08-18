import React, { useState } from 'react';
import { exportBundle, importBundle } from '../utils/storage';
import { loadSyncConfig, pullFromCloud, pushToCloud, saveSyncConfig } from '../utils/cloud';

const CloudSyncPanel: React.FC = () => {
  const [cfg, setCfg] = useState(() => loadSyncConfig());
  const [url, setUrl] = useState(cfg?.endpointUrl || '');
  const [apiKey, setApiKey] = useState(cfg?.apiKey || '');
  const [status, setStatus] = useState<string>('');

  const saveCfg = () => { const next = url ? { endpointUrl: url, apiKey: apiKey || undefined } : null; saveSyncConfig(next); setCfg(next); setStatus('Config sauvegardée'); };
  const doPush = async () => { if (!cfg) return; const ok = await pushToCloud(JSON.parse(exportBundle()), cfg); setStatus(ok ? 'Synchronisé vers le cloud' : "Échec d'envoi"); };
  const doPull = async () => { if (!cfg) return; const data = await pullFromCloud(cfg); if (data) { importBundle(JSON.stringify(data)); setStatus('Données importées'); } else { setStatus("Échec de récupération"); } };

  return (
    <div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1F2A2E]">Synchronisation cloud</h3>
        <div className="text-xs text-[#47555A]">Endpoint personnalisé</div>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-sm">Endpoint URL
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://api.example.com/palettes" className="w-full px-2 py-2 rounded-lg bg-white/70 border" />
        </label>
        <label className="text-sm">API Key (optional)
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Bearer token" className="w-full px-2 py-2 rounded-lg bg-white/70 border" />
        </label>
        <div className="flex items-end">
          <button onClick={saveCfg} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Enregistrer</button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button disabled={!cfg} onClick={doPush} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border disabled:opacity-50">Push</button>
        <button disabled={!cfg} onClick={doPull} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border disabled:opacity-50">Pull</button>
        {status && <div className="text-xs text-[#47555A]">{status}</div>}
      </div>
    </div>
  );
};

export default CloudSyncPanel;

