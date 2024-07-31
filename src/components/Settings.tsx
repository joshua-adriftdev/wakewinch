import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Dimensions, Pressable, Alert, Switch } from "react-native";
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PanGestureHandler } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Preset } from "../screens/Home/Home";
import uuid from 'react-native-uuid';
import manager, { Settings } from "../state/BluetoothLowEnergy/BluetoothLeManager";

const { height } = Dimensions.get('window');

interface SettingsProps {
  visible: boolean;
  onClose: (settings: Settings) => void;
  settings: Settings | null | undefined;
}

const SettingsModal: React.FC<SettingsProps> = ({ visible, onClose, settings }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const [safety, setSafety] = useState(true);
  const toggleSafetySwitch = () => setSafety(previousState => !previousState);

  const [ropeLength, setRopeLength] = useState('25');
  const [interval, setInterval] = useState('0.5');

  const handleGestureEnd = () => {
    runOnJS(() => { handleClose() })();
  };

  /*function generateSettings = Settings() {
    return {fine: isEnabled, length: Number(ropeLength), interval: Number(interval), name: ""}
  }*/

  const disconnect = () => {
    if (manager.device) {
      manager.bleManager.cancelDeviceConnection(manager.device.id);
      handleClose();
    } else {
      handleClose();
    }
      
  }

  const handleClose = () => {
    const updatedSettings = {
      fine: isEnabled,
      length: Number(ropeLength),
      interval: Number(interval),
      safety: safety
    };
    onClose(updatedSettings); // Pass the updated settings to the parent component
  };

  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.fine);
      setInterval(String(settings.interval));
      setRopeLength(String(settings.length));
      setSafety(settings.safety);
    }
  }, [settings])

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      style={styles.modal}
    >
      <PanGestureHandler
        onEnded={handleGestureEnd}
      >
        <View style={styles.modalContent}>
            <View style={{flex: 1, flexDirection: "column"}}>
                <Text style={{fontSize: 32, fontWeight: "600", color: "#0A2543"}}>
                    Settings
                </Text>
                <View style={{marginTop: 20, flex: 1, flexDirection: "column", gap: 20}}>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <View style={{flexDirection: "column"}}>
                      <Text style={{fontSize: 24, fontWeight: "400", color: "#0A2543"}}>Fine Control</Text>
                      <Text style={{fontSize: 13, fontWeight: "400", color: "#0A2543", maxWidth: 250}}>If enabled, the in/out buttons will no longer move the length in intervals</Text>
                    </View>
                    <Switch
                      trackColor={{false: '#E9E9EA', true: '#65C466'}}
                      thumbColor={isEnabled ? '#fff' : '#fff'}
                      ios_backgroundColor="#E9E9EA"
                      onValueChange={toggleSwitch}
                      value={isEnabled}
                      style={{marginLeft: "auto"}}
                    />
                  </View>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <View style={{flexDirection: "column"}}>
                      <Text style={{fontSize: 24, fontWeight: "400", color: "#0A2543"}}>Safety</Text>
                      <Text style={{fontSize: 13, fontWeight: "400", color: "#0A2543", maxWidth: 250}}>If safety is enabled, if the colour sensor fails for 3 second or more, the winch will automatically turn off.</Text>
                    </View>
                    <Switch
                      trackColor={{false: '#E9E9EA', true: '#65C466'}}
                      thumbColor={isEnabled ? '#fff' : '#fff'}
                      ios_backgroundColor="#E9E9EA"
                      onValueChange={toggleSafetySwitch}
                      value={safety}
                      style={{marginLeft: "auto"}}
                    />
                  </View>

                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <View style={{flexDirection: "column"}}>
                      <Text style={{fontSize: 24, fontWeight: "400", color: "#0A2543"}}>Rope Length</Text>
                      <Text style={{fontSize: 13, fontWeight: "400", color: "#0A2543", maxWidth: 250}}>The length of the rope in metres</Text>
                    </View>

                    <TextInput
                        style={{marginLeft: "auto", backgroundColor: "#E9E9EA", height: 30, borderRadius: 7, paddingHorizontal: 30, fontSize: 14, fontWeight: "400", color: "#0A2543"}}
                        value={ropeLength}
                        onChangeText={(e) => {setRopeLength(e)}}
                        keyboardType="numeric"
                        returnKeyType="done"
                      />
                    
                  </View>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <View style={{flexDirection: "column"}}>
                      <Text style={{fontSize: 24, fontWeight: "400", color: "#0A2543"}}>Interval</Text>
                      <Text style={{fontSize: 13, fontWeight: "400", color: "#0A2543", maxWidth: 250}}>The spacing between the rope's black markers in metres</Text>
                    </View>

                    <TextInput
                        style={{marginLeft: "auto", backgroundColor: "#E9E9EA", height: 30, borderRadius: 7, paddingHorizontal: 30, fontSize: 14, fontWeight: "400", color: "#0A2543"}}
                        value={interval}
                        onChangeText={(e) => {setInterval(e)}}
                        keyboardType="numeric"
                        returnKeyType="done"
                      />
                    
                  </View>
                  {/* <View style={{flexDirection: "row", alignItems: "center"}}>
                    <View style={{flexDirection: "column"}}>
                      <Text style={{fontSize: 24, fontWeight: "400", color: "#0A2543"}}>Name</Text>
                      <Text style={{fontSize: 13, fontWeight: "400", color: "#0A2543", maxWidth: 250}}>Rename your WakeWinch!</Text>
                    </View>

                    <TextInput
                        style={{marginLeft: "auto", backgroundColor: "#E9E9EA", height: 30, borderRadius: 7, paddingHorizontal: 30, fontSize: 14, fontWeight: "400", color: "#0A2543"}}
                        value={name}
                        onChangeText={(e) => {setName(e)}}
                        keyboardType="default"
                        returnKeyType="done"
                      />
                    
                  </View>
                  
                    <View style={{flexDirection: "column"}}>
                    <Text style={{fontSize: 24, fontWeight: "400", color: "#0A2543"}}>Name</Text>
                    <Text style={{fontSize: 13, fontWeight: "400", color: "#0A2543", maxWidth: 250}}>Rename your WakeWinch!</Text>

                    <TextInput
                        style={{marginRight: "auto", backgroundColor: "#E9E9EA", height: 35, borderRadius: 7, paddingHorizontal: 30, fontSize: 16, fontWeight: "400", color: "#0A2543", marginTop: 5}}
                        value={name}
                        onChangeText={(e) => {setName(e)}}
                        keyboardType="default"
                        returnKeyType="done"
                      />
                    
                  </View>
                  */}
                  <Pressable style={({pressed}) => [{
                    backgroundColor: pressed ? "rgba(255, 76, 76, 0.3)" : "rgba(255, 76, 76, 0.2)",
                    borderRadius: 10,
                    marginBottom: 40,
                    marginTop: "auto",
                    alignItems: "center",
                    justifyContent: "center"
                  }]}
                  onPress={disconnect}
                   >
                    <Text style={{paddingVertical: 15, fontSize: 20, fontWeight: "600", color: "rgb(255, 76, 76)"}}>Disconnect</Text>
                  </Pressable>
                </View>
              </View>
        </View>
      </PanGestureHandler>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0, // Ensure modal uses full screen width and height
    justifyContent: 'flex-end', // Align modal to the bottom of the screen
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.7, // Ensure it takes a significant portion of 
  },
  addButton: {
    backgroundColor: "#3A93F8",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  addPresetButton: {
    backgroundColor: "#3A93F8",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: "#3A93F8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  presetItem: {
    paddingVertical: 15, 
    borderBottomWidth: 0, // Line
    borderBottomColor: "#ccc",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: "rgba(255, 76, 76, 0.2)",
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: "center"
  },
  deleteText: {
    color: '#FF4C4C',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: "#0A2543",
    color: "#0A2543",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  pickerLabel: {
    fontSize: 18,
    color: "#0A2543"
  },
  picker: {
    flex: 1,
  },
});

export default SettingsModal;
