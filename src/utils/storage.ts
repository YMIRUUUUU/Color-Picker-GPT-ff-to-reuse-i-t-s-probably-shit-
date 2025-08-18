const STORAGE_KEY = 'pm_palettes';
const HISTORY_KEY = 'pm_history';
const FAVORITES_KEY = 'pm_favorites_v1';

export function loadPalettes(): string[][] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePalette(palette: string[]): string[][] {
  const palettes = loadPalettes();
  palettes.push(palette);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
  } catch {
    // ignore write errors
  }
  return palettes;
}

// Color history (recent first)
export function loadHistory(limit = 24): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, limit) : [];
  } catch {
    return [];
  }
}

export function pushHistory(hex: string, limit = 24): string[] {
  const current = loadHistory(limit * 2);
  const next = [hex, ...current.filter(c => c.toLowerCase() !== hex.toLowerCase())].slice(0, limit);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
  return next;
}

// Favorites with tags
export type FavoriteColor = { hex: string; tags: string[] };

export function loadFavorites(): FavoriteColor[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const arr: FavoriteColor[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function saveFavorites(list: FavoriteColor[]): FavoriteColor[] {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(list)); } catch {}
  return list;
}

export function toggleFavorite(hex: string): FavoriteColor[] {
  const favs = loadFavorites();
  const i = favs.findIndex(f => f.hex.toLowerCase() === hex.toLowerCase());
  if (i >= 0) {
    favs.splice(i, 1);
  } else {
    favs.unshift({ hex, tags: [] });
  }
  return saveFavorites(favs);
}

export function setFavoriteTags(hex: string, tags: string[]): FavoriteColor[] {
  const favs = loadFavorites();
  const i = favs.findIndex(f => f.hex.toLowerCase() === hex.toLowerCase());
  if (i >= 0) {
    favs[i] = { ...favs[i], tags };
  } else {
    favs.unshift({ hex, tags });
  }
  return saveFavorites(favs);
}

// Export/Import bundle
export type ExportBundle = {
  palettes: string[][];
  history: string[];
  favorites: FavoriteColor[];
};

export function exportBundle(): string {
  const data: ExportBundle = {
    palettes: loadPalettes(),
    history: loadHistory(),
    favorites: loadFavorites(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBundle(json: string): ExportBundle | null {
  try {
    const data = JSON.parse(json) as ExportBundle;
    if (!data || typeof data !== 'object') return null;
    if (Array.isArray(data.palettes)) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.palettes));
    if (Array.isArray(data.history)) localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
    if (Array.isArray(data.favorites)) localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));
    return data;
  } catch {
    return null;
  }
}
