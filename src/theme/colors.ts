export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  border: string;
  glass: string;
  inverseBackground: string;
  inverseText: string;
  overlay: string;
  pureWhite: string;
  pureBlack: string;
};

export const darkColors: ThemeColors = {
  background: '#0a0a0f',
  surface: '#111116',
  surfaceElevated: '#18181b', // zinc-900
  surfaceHighlight: '#27272a', // zinc-800
  text: '#f4f4f5', // zinc-100
  textMuted: '#a1a1aa', // zinc-400
  textSubtle: '#71717a', // zinc-500
  primary: '#ec4747', // user requested red
  primaryHover: '#d93b3b',
  primarySoft: 'rgba(249, 88, 80, 0.12)',
  danger: '#ef4444', // red-500
  dangerSoft: 'rgba(239, 68, 68, 0.15)',
  success: '#22c55e', // green-500
  successSoft: 'rgba(34, 197, 94, 0.15)',
  border: 'rgba(255, 255, 255, 0.08)',
  glass: 'rgba(255, 255, 255, 0.03)',
  inverseBackground: '#f4f4f5',
  inverseText: '#18181b',
  overlay: 'rgba(0, 0, 0, 0.6)',
  pureWhite: '#ffffff',
  pureBlack: '#000000',
};

export const lightColors: ThemeColors = {
  background: '#f8f8f8',
  surface: '#ffffff', // pure white
  surfaceElevated: '#ffffff',
  surfaceHighlight: '#e4e4e7', // zinc-200
  text: '#18181b', // zinc-900
  textMuted: '#52525b', // zinc-600
  textSubtle: '#71717a', // zinc-500
  primary: '#ec4747', // user requested red
  primaryHover: '#d93b3b',
  primarySoft: 'rgba(249, 88, 80, 0.1)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239, 68, 68, 0.1)',
  success: '#22c55e',
  successSoft: 'rgba(34, 197, 94, 0.1)',
  border: 'rgba(0, 0, 0, 0.08)',
  glass: 'rgba(0, 0, 0, 0.03)',
  inverseBackground: '#0a0a0f',
  inverseText: '#f4f4f5',
  overlay: 'rgba(0, 0, 0, 0.4)',
  pureWhite: '#ffffff',
  pureBlack: '#000000',
};
