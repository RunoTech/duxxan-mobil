import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.duxxan.mobile',
  appName: 'DUXXAN',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Browser: {
      windowName: '_blank'
    },
    App: {
      launchAutoHide: true
    }
  }
};

export default config;
