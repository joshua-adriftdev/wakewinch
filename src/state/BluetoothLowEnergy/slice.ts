import { PayloadAction, createAction, createSlice } from "@reduxjs/toolkit";
import { DeviceReference } from "./BluetoothLeManager";

interface BluetoothState {
  allDevices: DeviceReference[];
  currentColor: string;
  connectedDevice: DeviceReference | null;
  retrievedNumber?: string | null;
}

const initialState: BluetoothState = {
  allDevices: [],
  currentColor: "#FFFFFF",
  connectedDevice: null,
  retrievedNumber: undefined,
};

const isDuplicteDevice = (
  devices: DeviceReference[],
  nextDevice: DeviceReference
) => devices.findIndex((device) => nextDevice.id === device.id) > -1;

export type DevicesAction = PayloadAction<DeviceReference>;

export const startScanning = createAction("bleState/startScanning");
export const startListening = createAction("bleState/startListening");

const bleState = createSlice({
  name: "bleState",
  initialState,
  reducers: {
    setDevice: (state, action: DevicesAction) => {
      if (!isDuplicteDevice(state.allDevices, action.payload)) {
        state.allDevices = [...state.allDevices, action.payload];
      }
    },
    setConnectedDevice: (state, action: PayloadAction<DeviceReference>) => {
      state.connectedDevice = action.payload;
    },
    setRetrievedNumber: (state, action: PayloadAction<string | null | undefined>) => {
      state.retrievedNumber = action.payload;
    },
  },
});

export const { setDevice, setConnectedDevice, setRetrievedNumber } =
  bleState.actions;

export default bleState.reducer;
