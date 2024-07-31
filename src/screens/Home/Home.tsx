import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { useNavigation } from "@react-navigation/native";
import { startListening } from "../../state/BluetoothLowEnergy/slice";
import { sendLength, sendSettings, sendString } from "../../state/BluetoothLowEnergy/listener";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PresetsModal from "../../components/Presets"; // Ensure the path is correct based on your file structure
import Wave from "../../components/Wave";
import images from '../../../assets/images'
import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";
import { FontAwesome6 } from '@expo/vector-icons';
import { Connect } from "../../components/Connect";
import { Controls } from "../../components/Controls";
import SettingsModal from "../../components/Settings";
import manager, { Settings } from "../../state/BluetoothLowEnergy/BluetoothLeManager";

const { width, height } = Dimensions.get("window");

export interface Preset {
  id: string;
  name: string;
  length: number;
}

export const Home = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const retrievedNumber = useAppSelector((state) => state.ble.retrievedNumber);
  const settings: Settings | null | undefined = useAppSelector((state) => state.ble.settings);
  let isConnected = useAppSelector((state) => state.ble.connectedDevice);

  const [selectedPreset, setSelectedPreset] = useState<Preset>();
  const [presetVisisble, setPresetVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [currentSettings, setCurrentSetting] = useState<Settings>({fine: false, interval: 0.5, length: 25, safety: true});

  useEffect(() => {
    manager.setOnSafetyEngaged(() => {
      Alert.alert(
        "Safety Engaged",
        "The colour sensor failed and safety mode was engaged. You may continue use by disabling safety, and enabling fine control.",
        [
          { text: "Okay", style: "default" },
        ],
        { cancelable: true }
      );
    })
  }, [])

  useEffect(() => {
    if (isConnected) {
      dispatch(startListening());
    }
  }, [isConnected]);

  const togglePresets = () => setPresetVisible(!presetVisisble);
  const toggleSettings = () => setSettingsVisible(!settingsVisible);

  const winchIn = () => {
    dispatch(sendString("in"));
    setSelectedPreset(undefined);
  };

  const winchOut = () => {
    dispatch(sendString("out"));
    setSelectedPreset(undefined);
  };

  const winchStop = () => {
    dispatch(sendString("stop"));
    setSelectedPreset(undefined);
  };

  const stopAll = () => {
    winchStop();
    setSelectedPreset(undefined);
  }

  const emergencyStop = () => {
    dispatch(sendString("estop"));
    setSelectedPreset(undefined);
  }

  const setPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    dispatch(sendLength("" + preset.length));
  };

  const showPreset = () => {
    togglePresets();
  }

  const returnToHome = () => {
    setPreset({id: "ww_Home", name: "Home", length: 0})
  }

  const handleSettingsClose = (newSettings: Settings) => {
    toggleSettings(); // close the modal
    dispatch(sendSettings(newSettings));
    setCurrentSetting(newSettings)
  };
  

  return (
    <View style={styles.container}>
      <View style={{}}>
        <Wave/>
        <Image
            style={{ height: 52, width: 157.485714, position: "absolute", top: 60, left: 20}}
            source={images.banner}
          />
        <TouchableOpacity
          onPress={toggleSettings}
          style={{ position: "absolute", top: 60, right: 20, display: isConnected ? 'flex' : 'none' }}
        >
          <FontAwesome6 name="gear" size={32} color="white" style={{}}/>
        </TouchableOpacity>
        <View style={{backgroundColor: 'rgba(255, 255, 255, 0.7)', position: "absolute", top: 132, left: 20, borderRadius: 100, padding: 7, paddingHorizontal: 20, flex: 1, flexDirection: "row", gap: 10, alignItems: "center"}}>
          <View style={{backgroundColor: (isConnected ? "#28A745" : "#FF7C3B"), width: 12.5, height: 12.5, borderRadius: 100}}>
            <Text></Text>
          </View>
          <Text style={{color: "#0A2543", fontSize: 17}}>
            {isConnected ? 'Connected' : 'Waiting for connection'}
          </Text>
        </View>
      </View>
      {isConnected ? (
        <Controls selectedPreset={selectedPreset} length={retrievedNumber} winchIn={winchIn} winchOut={winchOut} winchStop={winchStop} stopAll={stopAll} emergencyStop={emergencyStop} showPreset={showPreset} returnToHome={returnToHome} settings={currentSettings}/>
      ) : (
        <Connect/>
      )}
      <PresetsModal
        visible={presetVisisble}
        onClose={togglePresets}
        setPreset={setPreset} 
        currentLength={Number(retrievedNumber)}    
        settings={currentSettings}  
        />
        <SettingsModal
        visible={settingsVisible}
        onClose={handleSettingsClose}  
        settings={settings}
        />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  showPresetsButton: {
    backgroundColor: "#3A93F8",
    padding: 10,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default Home;
