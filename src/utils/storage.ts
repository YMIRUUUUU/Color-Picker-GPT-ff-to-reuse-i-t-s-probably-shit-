const STORAGE_KEY = 'pm_palettes';

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
