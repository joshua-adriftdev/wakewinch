import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View, Text } from "react-native";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { useNavigation } from "@react-navigation/native";
import { startListening } from "../../state/BluetoothLowEnergy/slice";
import { sendLength, sendString } from "../../state/BluetoothLowEnergy/listener";

const { width, height } = Dimensions.get("window");

export const Home = () => {
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const retrievedNumber = useAppSelector((state) => state.ble.retrievedNumber);

  const isConnected = useAppSelector((state) => state.ble.connectedDevice);


  const winchIn = () => {
    dispatch(sendString("in"));
  }

  const winchOut = () => {
    dispatch(sendString("out"));
  }

  const winchStop = () => {
    dispatch(sendString("stop"));
  }

  const updateLength = () => {
    let l = Math.floor(Math.random() * 100) + 1
    dispatch(sendLength(""+l));
  }

  useEffect(() => {
    if (isConnected) {
      dispatch(startListening());
    }
  }, [isConnected]);

  return (
    <View style={styles.container}>
          {isConnected ? (
            <View>
              <Text 
              style={{
                marginLeft: 20,
                marginBottom: 20,
                fontSize: 36,
              }}
              >
                Controls
              </Text>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed ? "#669dde" : "#76B3FA",
                    marginTop: 40,
                    marginLeft: 20,
                    marginRight: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    height: 70,
                    borderRadius: 18,
                  }
                ]}
                onPressIn={() => {
                  winchIn();
                }}
                onPressOut={() => {
                  winchStop();
                }}
              >
                <Text style={{ fontSize: 25, color: "white" }}>
                  Winch In
                </Text>
              </Pressable>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed ? "#669dde" : "#76B3FA",
                    marginTop: 20,
                    marginLeft: 20,
                    marginRight: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    height: 70,
                    borderRadius: 18,
                  }
                ]}
                onPressIn={() => {
                  winchOut();
                }}
                onPressOut={() => {
                  winchStop();
                }}
              >
                <Text style={{ fontSize: 25, color: "white" }}>
                  Winch Out
                </Text>
              </Pressable>
              <Pressable
                style={{
                  backgroundColor: "#76B3FA",
                  marginTop: 40,
                  marginLeft: 20,
                  marginRight: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 70,
                  borderRadius: 18,
                }}
                onPress={() => {
                  // @ts-ignore
                  updateLength();
                }}
              >
                <Text style={{ fontSize: 25, color: "white" }}>
                  Send Length
                </Text>
              </Pressable>
              <Text style={{fontSize: 20, marginTop: 20, marginLeft: 20}}>
                Length: {retrievedNumber}
              </Text>
            </View>
          ) : (
            <View style={styles.container}>
              <Pressable
                style={{
                  backgroundColor: "#76B3FA",
                  marginLeft: 20,
                  marginRight: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 70,
                  borderRadius: 18,
                }}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('Connect');
                }}
              >
                <Text style={{ fontSize: 25, color: "white" }}>
                  Connect a Device
                </Text>
              </Pressable>
            </View>
          )}
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  canvas: {
    flex: 1,
  },
  cursor: {
    backgroundColor: "green",
  },
  ghost: {
    flex: 2,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
});
