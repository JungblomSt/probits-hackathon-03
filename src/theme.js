// Färger och mått från mockupen
export const colors = {
  bg: '#F3F4EE',
  card: '#FFFFFF',
  ink: '#15201A',
  muted: '#4F5B55',
  line: '#E2E5DD',
  lineStrong: '#D2D7CC',
  soft: '#EEF0E9',
  accent: '#1D6B47',
  accentDark: '#134A31',
  accentSoft: '#DCEBE2',
  mint: '#9FD9B6',
  today: '#B8501C',
  todaySoft: '#F8E3D6',
  todayText: '#8A3A12',
  dark2: '#2A3830',
  dark3: '#3A4A41',
  onDark: '#C9D3CC',
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 28, pill: 999 };

export const type = {
  display: { fontSize: 34, fontWeight: '800', lineHeight: 38, color: colors.ink },
  h2: { fontSize: 20, fontWeight: '700', color: colors.ink },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  overline: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: { fontSize: 15, color: colors.ink },
  small: { fontSize: 12, color: colors.muted },
};

export const DIFFICULTIES = ['Lätt', 'Medel', 'Tuff'];
