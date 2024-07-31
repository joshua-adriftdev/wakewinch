import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../state/store";
import { startScanning } from "../state/BluetoothLowEnergy/slice";
import { connectToDevice } from "../state/BluetoothLowEnergy/listener";

export const Connect = () => {
  const dispatch = useAppDispatch();
  const discoveredDevices = useAppSelector((state) => state.ble.allDevices);

  useEffect(() => {
    console.log("Scanning...");
    dispatch(startScanning());
  }, []);

  const onDeviceSelected = (deviceId: any) => {
    dispatch(connectToDevice(deviceId));
  };

  return (
    <View style={styles.container}>
      <Text style={{fontWeight: "600", fontSize: 32, color: "#0A2543", marginTop: 10}}>Available Devices</Text>
      <Text style={{fontWeight: "400", fontSize: 16, color: "#0A2543"}}>Select your WakeWinch to connect</Text>
      <FlatList
        style={styles.list}
        data={discoveredDevices}
        renderItem={({ item }) => {
          const selectDevice = () => {
            onDeviceSelected(item);
          };

          return (
            <Pressable style={styles.deviceBtn} onPress={selectDevice}>
              <Text style={styles.deviceTxt}>{item.name?.replaceAll(" (WW267)", "")}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  list: {
    marginTop: 10,
    flex: 1,
  },
  deviceBtn: {
    backgroundColor: "#3A93F8",
    justifyContent: "center",
    marginTop: 20,
    height: 70,
    borderRadius: 15,
  },
  deviceTxt: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "400",
  },
});
