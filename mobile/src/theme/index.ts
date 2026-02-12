import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1e90ff',
    secondary: '#20c997',
    tertiary: '#ffc107',
    error: '#dc3545',
    background: '#f8f9fa',
    surface: '#ffffff',
    onSurface: '#212529',
    elevation: {
      level0: '#ffffff',
      level1: '#f8f9fa',
      level2: '#e9ecef',
      level3: '#dee2e6',
      level4: '#ced4da',
      level5: '#adb5bd',
    }
  },
  roundness: 12
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#1e90ff',
    secondary: '#20c997',
    tertiary: '#ffc107',
    error: '#dc3545',
  },
  roundness: 12
};
