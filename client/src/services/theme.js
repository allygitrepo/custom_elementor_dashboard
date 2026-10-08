// client/src/services/theme.js

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Indigo',
    category: 'Dark',
    description: 'Deep space navy with royal indigo & violet accents (Default)',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    bgColor: '#090d16',
    cardColor: '#111726',
    textColor: '#f8fafc',
    glowColor: 'rgba(99, 102, 241, 0.4)'
  },
  {
    id: 'obsidian',
    name: 'Obsidian OLED',
    category: 'Dark',
    description: 'Pitch black background with high-contrast electric cyan & sky blue',
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    bgColor: '#04060a',
    cardColor: '#0b0f17',
    textColor: '#f1f5f9',
    glowColor: 'rgba(6, 182, 212, 0.4)'
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    category: 'Dark',
    description: 'Deep slate green with vibrant mint & emerald glow',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    bgColor: '#040f0c',
    cardColor: '#0a1d17',
    textColor: '#ecfdf5',
    glowColor: 'rgba(16, 185, 129, 0.4)'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Dark',
    description: 'Futuristic night violet with hot magenta & electric purple accents',
    primaryColor: '#ec4899',
    secondaryColor: '#a855f7',
    bgColor: '#0b0714',
    cardColor: '#160e26',
    textColor: '#fae8ff',
    glowColor: 'rgba(236, 72, 153, 0.4)'
  },
  {
    id: 'sunset',
    name: 'Sunset Crimson',
    category: 'Dark',
    description: 'Velvet dark burgundy with warm rose & amber highlights',
    primaryColor: '#f43f5e',
    secondaryColor: '#fb923c',
    bgColor: '#14070a',
    cardColor: '#240e15',
    textColor: '#fff1f2',
    glowColor: 'rgba(244, 63, 94, 0.4)'
  },
  {
    id: 'light',
    name: 'Clean Modern Light',
    category: 'Light',
    description: 'Crisp bright workspace with soft slate cards & indigo buttons',
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    bgColor: '#f1f5f9',
    cardColor: '#ffffff',
    textColor: '#0f172a',
    glowColor: 'rgba(79, 70, 229, 0.25)'
  }
];

export function getSavedTheme() {
  try {
    const saved = localStorage.getItem('elem_admin_theme');
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
  } catch {}
  return 'midnight';
}

export function applyAdminTheme(themeId = null) {
  const chosen = themeId || getSavedTheme();
  const valid = THEMES.some(t => t.id === chosen) ? chosen : 'midnight';
  document.documentElement.setAttribute('data-theme', valid);
  if (themeId) {
    try {
      localStorage.setItem('elem_admin_theme', valid);
    } catch {}
  }
  return valid;
}

export function applyPublicTheme() {
  document.documentElement.setAttribute('data-theme', 'midnight');
}

// Backward compatibility alias
export const applyTheme = applyAdminTheme;
