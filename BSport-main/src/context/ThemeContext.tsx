export const lightTheme = {
  BG: '#F3F4F6',
  CARD: '#FFFFFF',
  TEXT_MAIN: '#111827',
  TEXT_SUB: '#6B7280',
  BORDER: '#E5E7EB',
  BORDERLINE: '#D1D5DB', 
  INPUT_BG: '#F9FAFB',
  ACCENT: '#FF5E00',
  SUCCESS: '#10B981',      
  DANGER: '#EF4444',       
  DANGER_BG: '#FEE2E2',    
  GLASS: 'rgba(0,0,0,0.04)', 
  STATUSBAR: 'dark-content' as const, 
};

export const darkTheme = {
  BG: '#050505',
  CARD: '#121212',
  TEXT_MAIN: '#FFFFFF',
  TEXT_SUB: '#8E8E93',
  BORDER: '#262626',
  BORDERLINE: '#F8AD3C', 
  INPUT_BG: '#1A1A1A',
  ACCENT: '#FF5E00',
  SUCCESS: '#34C759',     
  DANGER: '#FF453A',       
  DANGER_BG: '#2A1212',
  GLASS: 'rgba(255,255,255,0.05)',
  STATUSBAR: 'light-content' as const,
};

export const getTheme = (isDarkMode: boolean) => isDarkMode ? darkTheme : lightTheme;