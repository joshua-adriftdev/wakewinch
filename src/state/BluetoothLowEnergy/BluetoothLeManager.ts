import base64 from "react-native-base64";
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

class BluetoothLeManager {
  bleManager: BleManager;
  device: Device | null;
  characteristic: Characteristic | null = null;

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
            console.log("Found characteristic: ", characteristic.uuid);
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
      if (!this.device || !this.characteristic) {
        throw new Error("No connected device or characteristic not found");
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

  // Functions to control LED based on your Arduino code
  turnOnLED = async () => {
    await this.sendString("1");
  };

  turnOffLED = async () => {
    await this.sendString("2");
  };

  flashLED = async () => {
    await this.sendString("3");
  };
}

const manager = new BluetoothLeManager();

export default manager;
