import base64, { decode } from "react-native-base64";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

export interface DeviceReference {
  name?: string | null;
  id?: string;
}

// Update the service and characteristic UUIDs
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const CHARACTERISTIC_WRITE_UUID = "19b10001-e8f2-537e-4f6c-d104768a1215";
const CHARACTERISTIC_WRITE_LENGTH_UUID = "19b10001-e8f2-537e-4f6c-d104768a1216";
const CHARACTERISTIC_READ_UUID = "19b10002-e8f2-537e-4f6c-d104768a1217";

class BluetoothLeManager {
  bleManager: BleManager;
  device: Device | null;
  characteristic: Characteristic | null = null;
  lengthCharacteristic: Characteristic | null = null;
  _readCharacteristic: Characteristic | null = null;
  onDataReceived: ((data: string) => void) | null = null;

  constructor() {
    this.bleManager = new BleManager();
    this.device = null;
  }

  scanForPeripherals = (
    onDeviceFound: (deviceSummary: DeviceReference) => void
  ) => {
    this.bleManager.startDeviceScan(null, null, (_, scannedDevice) => {
      onDeviceFound({
        id: scannedDevice?.id,
        name: scannedDevice?.localName ?? scannedDevice?.name,
      });
    });
  };

  stopScanningForPeripherals = () => {
    this.bleManager.stopDeviceScan();
  };

  connectToPeripheral = async (identifier: string) => {
    try {
      this.device = await this.bleManager.connectToDevice(identifier);
      await this.device.discoverAllServicesAndCharacteristics();
      console.log("Connected to device and discovered services and characteristics");

      const services = await this.device.services();
      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          console.log("[General Log] Discovered Characteristic: " + characteristic.uuid);
          if (characteristic.uuid === CHARACTERISTIC_WRITE_UUID) {
            this.characteristic = characteristic;
            console.log("Found Write characteristic: ", characteristic.uuid);
          }
          if (characteristic.uuid === CHARACTERISTIC_WRITE_LENGTH_UUID) {
            this.lengthCharacteristic = characteristic;
            console.log("Found Length characteristic: ", characteristic.uuid);
          }
          if (characteristic.uuid === CHARACTERISTIC_READ_UUID) {
            this._readCharacteristic = characteristic;
            console.log("Found Read characteristic: ", characteristic.uuid);
            await this.startNotification();
          }
        }
      }
    } catch (error) {
      console.log("Failed to connect to device", error);
    }
  };

  sendString = async (message: string) => {
    const data = base64.encode(message);
    try {
      if (!this.device) {
        throw new Error("No connected device");
      }
      if (!this.characteristic) {
        throw new Error("Characteristic not found");
      }
      await this.bleManager.writeCharacteristicWithResponseForDevice(
        this.device.id,
        SERVICE_UUID,
        CHARACTERISTIC_WRITE_UUID,
        data
      );
      console.log("Data sent successfully");
    } catch (error) {
      console.log("Failed to send data", error);
    }
  };

  sendLength = async (length: string) => {
    const data = base64.encode(length);
    try {
      if (!this.device) {
        throw new Error("No connected device");
      }
      if (!this.characteristic) {
        throw new Error("Characteristic not found");
      }
      await this.bleManager.writeCharacteristicWithResponseForDevice(
        this.device.id,
        SERVICE_UUID,
        CHARACTERISTIC_WRITE_LENGTH_UUID,
        data
      );
      console.log("Length sent successfully");
    } catch (error) {
      console.log("Failed to send length", error);
    }
  };

  startNotification = async () => {
    if (this._readCharacteristic && this.device) {
      this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_READ_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("Notification error", error);
            return;
          }
          console.log("Received a thing");
          if (characteristic?.value) {
            const decodedValue = base64.decode(characteristic.value);
            console.log("Read Value: " + decodedValue)
            if (this.onDataReceived) {
              this.onDataReceived(decodedValue);
            }
          }
        }
      );
    }
  };

  setOnDataReceived = (callback: (data: string) => void) => {
    this.onDataReceived = callback;
  };
}

const manager = new BluetoothLeManager();

export default manager;
