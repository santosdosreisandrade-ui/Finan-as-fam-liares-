import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financas.familiares',
  appName: 'Finanças Familiares',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
