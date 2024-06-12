import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import manager, { DeviceReference } from './state/Bluetooth/BluetoothManager';

const App = () => {
  const [devices, setDevices] = useState<DeviceReference[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  const scanDevices = async () => {
    const foundDevices: DeviceReference[] = [];
    await manager.scanForDevices((device) => {
      foundDevices.push(device);
      setDevices([...foundDevices]);
    });
  };

  const connectToDevice = async (deviceId: string) => {
    await manager.connectToDevice(deviceId);
    setConnectedDevice(deviceId);
  };

  return (
    <View>
      <Text>Bluetooth Devices:</Text>
      <Button title="Scan for Devices" onPress={scanDevices} />
      {devices.map((device) => (
        <Button
          key={device.id}
          title={`Connect to ${device.name}`}
          onPress={() => connectToDevice(device.id!)}
        />
      ))}
      {connectedDevice && (
        <View>
          <Button title="Turn On LED" onPress={manager.turnOnLED} />
          <Button title="Turn Off LED" onPress={manager.turnOffLED} />
          <Button title="Flash LED" onPress={manager.flashLED} />
        </View>
      )}
    </View>
  );
};

export default App;
