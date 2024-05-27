import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAppDispatch } from "../../state/store";
import { sendString } from "../../state/BluetoothLowEnergy/listener";

export const Write = () => {
  const dispatch = useAppDispatch();

  const sendData = () => {
    dispatch(sendString("1"));
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={sendData}>
        <Text style={styles.ctaBtnTxt}>Send Random Color To Server</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "purple",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  ctaBtnTxt: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
});
