import { createAsyncThunk, createListenerMiddleware } from "@reduxjs/toolkit";
import {
  setConnectedDevice,
  setDevice,
  setRetrievedNumber,
  setSettings,
  startListening,
  startScanning,
} from "./slice";

import bluetoothLeManager, { DeviceReference, Settings } from "./BluetoothLeManager";

export const bleMiddleware = createListenerMiddleware();

export const connectToDevice = createAsyncThunk(
  "bleThunk/connectToDevice",
  async (ref: DeviceReference, thunkApi) => {
    if (ref.id) {
      await bluetoothLeManager.connectToPeripheral(ref.id);
      thunkApi.dispatch(setConnectedDevice(ref));
      bluetoothLeManager.stopScanningForPeripherals();
    }
  }
);

export const sendString = createAsyncThunk(
  "bleThunk/sendString",
  async (s: string, _) => {
    await bluetoothLeManager.sendString(s);
  }
);

export const sendLength = createAsyncThunk(
  "bleThunk/sendString",
  async (s: string, _) => {
    await bluetoothLeManager.sendLength(s);
  }
);

export const sendSettings = createAsyncThunk(
  "bleThunk/sendSettings",
  async (s: Settings, _) => {
    await bluetoothLeManager.sendSettings(s);
  }
);

bleMiddleware.startListening({
  actionCreator: startScanning,
  effect: (_, listenerApi) => {
    bluetoothLeManager.scanForPeripherals((device) => {
      //console.log("device", device);
      if (device.name != "" && device.name != null && (device.name.toLowerCase().includes("(WW267)".toLowerCase()))) {
        listenerApi.dispatch(setDevice(device));
      }
      //listenerApi.dispatch(setDevice(device));
    });
  },
});

export const startListeningForData = createAsyncThunk(
  "bleThunk/startListeningForData",
  async (_, thunkApi) => {
    bluetoothLeManager.setOnDataReceived((data: string) => {
      thunkApi.dispatch(setRetrievedNumber(data));
    });
  }
);

export const startListeningForSettings = createAsyncThunk(
  "bleThunk/startListeningForSettings",
  async (_, thunkApi) => {
    bluetoothLeManager.setOnSettingsReceived((settings: Settings) => {
      thunkApi.dispatch(setSettings(settings));
    });
  }
);

bleMiddleware.startListening({
  actionCreator: startListening,
  effect: (_, listenerApi) => {
    listenerApi.dispatch(startListeningForData());
  },
});

bleMiddleware.startListening({
  actionCreator: startListening,
  effect: (_, listenerApi) => {
    listenerApi.dispatch(startListeningForSettings());
  },
});