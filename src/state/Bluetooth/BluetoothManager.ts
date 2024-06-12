import { BluetoothSerial } from "react-native-bluetooth-serial";

export interface DeviceReference {
  name?: string | null;
  id?: string;
}

class BluetoothManager {
  private device: string | null = null;

  enableBluetooth = async (): Promise<void> => {
    try {
      const isEnabled = await BluetoothSerial.isEnabled();
      if (!isEnabled) {
        console.log('Bluetooth enabled? (Not Really)');
      } else {
        console.log('Bluetooth already enabled');
      }
    } catch (error) {
      console.log('Failed to enable Bluetooth', error);
    }
  };

  scanForDevices = async (onDeviceFound: (deviceSummary: DeviceReference) => void): Promise<void> => {
    try {
      const devices = await BluetoothSerial.list();
      devices.forEach(device => {
        onDeviceFound({ id: device.id, name: device.name });
      });
    } catch (error) {
      console.log('Failed to scan for devices', error);
    }
  };

  connectToDevice = async (identifier: string): Promise<void> => {
    try {
      await BluetoothSerial.connect(identifier);
      this.device = identifier;
      console.log('Connected to device', identifier);
    } catch (error) {
      console.log('Failed to connect to device', error);
    }
  };

  sendString = async (message: string): Promise<void> => {
    try {
      if (!this.device) {
        throw new Error('No connected device');
      }
      await BluetoothSerial.write(message);
      console.log('Data sent successfully');
    } catch (error) {
      console.log('Failed to send data', error);
    }
  };

  turnOnLED = async (): Promise<void> => {
    await this.sendString("1\n");
  };

  turnOffLED = async (): Promise<void> => {
    await this.sendString("2\n");
  };

  flashLED = async (): Promise<void> => {
    await this.sendString("3\n");
  };
}

const manager = new BluetoothManager();
export default manager;
