import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { startScanning } from "../../state/BluetoothLowEnergy/slice";
import { connectToDevice } from "../../state/BluetoothLowEnergy/listener";

export const ConnectA = () => {
  const nav = useNavigation();
  const dispatch = useAppDispatch();
  const discoveredDevices = useAppSelector((state) => state.ble.allDevices);

  useEffect(() => {
    dispatch(startScanning());
  }, []);

  const onDeviceSelected = (deviceId: any) => {
    dispatch(connectToDevice(deviceId));
    nav.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.deviceTxt}>Devices</Text>
      <FlatList
        style={styles.list}
        data={discoveredDevices}
        renderItem={({ item }) => {
          const selectDevice = () => {
            onDeviceSelected(item);
          };

          const _name = item.name || "WakeWinch";
          const name = _name.replace(/\s*\(WW267\)\s*/g, ""); // Use regular expression for global replacement

          // Debugging
          console.log("Original name:", _name);
          console.log("Processed name:", name);

          return (
            <Pressable style={styles.deviceBtn} onPress={selectDevice}>
              <Text style={styles.deviceTxt}>{name}</Text>
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
    backgroundColor: "#fff",
  },
  list: {
    marginTop: 30,
    flex: 1,
    marginHorizontal: 20,
  },
  deviceBtn: {
    backgroundColor: "#76B3FA",
    height: 70,
    justifyContent: "center",
    borderRadius: 15,
  },
  deviceTxt: {
    marginTop: 30,
    color: "#000",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
});
