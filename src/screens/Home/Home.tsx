import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View, Text } from "react-native";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { useNavigation } from "@react-navigation/native";
import { startListening } from "../../state/BluetoothLowEnergy/slice";
import { sendString } from "../../state/BluetoothLowEnergy/listener";

const { width, height } = Dimensions.get("window");

export const Home = () => {
  const [s, setS] = useState<string>("1");

  const dispatch = useAppDispatch();

  const navigation = useNavigation();


  const isConnected = useAppSelector((state) => state.ble.connectedDevice);


  const updateString = () => {
    if (s == "1") {
      dispatch(sendString("2"));
      setS("2");
    } else {
      dispatch(sendString("1"));
      setS("1");
    }
    
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
              <Text>Home Page</Text>
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
                  updateString();
                }}
              >
                <Text style={{ fontSize: 25, color: "white" }}>
                  Toggle Light ({s})
                </Text>
              </Pressable>
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
