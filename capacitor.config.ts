import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.alieqa.mobile',
  appName: 'عليقة',
  webDir: 'out',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#2E7D4F',
    initialFocus: true,
    pullToRefresh: true,
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
