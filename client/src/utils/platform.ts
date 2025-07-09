import { Device } from '@capacitor/device';

export const isMobile = async (): Promise<boolean> => {
  try {
    const info = await Device.getInfo();
    return info.platform === 'android' || info.platform === 'ios';
  } catch {
    // Fallback for web
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
};

export const isCapacitorApp = (): boolean => {
  return !!(window as any).Capacitor;
};