import BackgroundService from 'react-native-background-actions';

const sleep = (time: number) =>
  new Promise<void>(resolve => setTimeout(resolve, time));

// 🔥 Loop supaya service tetap hidup
export const trackingTask = async () => {
  console.log('Background service aktif');

  while (BackgroundService.isRunning()) {
    await sleep(2000);
  }
};

// 🔥 START SERVICE
export const startTrackingService = async () => {
  if (BackgroundService.isRunning()) return;

  await BackgroundService.start(trackingTask, {
    taskName: 'Tracking Aktif',
    taskTitle: "B'Sports Tracking",
    taskDesc: 'Aplikasi sedang merekam rute Anda',
    color: '#FC4C02',
    taskIcon: {
      name: 'ic_dialog_info',
      type: 'drawable',
      package: 'android',
    },
    foregroundServiceType: ['location'],
    parameters: {},
  });
};

// 🔥 STOP SERVICE
export const stopTrackingService = async () => {
  if (!BackgroundService.isRunning()) return;

  await BackgroundService.stop();
};