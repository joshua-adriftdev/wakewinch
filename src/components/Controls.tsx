import { Pressable, View, Text } from "react-native"

import { FontAwesome6 } from '@expo/vector-icons';
import { Preset } from "../screens/Home/Home";
import { Settings } from "../state/BluetoothLowEnergy/BluetoothLeManager";

type ControlProps = {
    selectedPreset: Preset | undefined;
    length: string | undefined | null;
    settings: Settings;
    winchIn: () => void;
    winchOut: () => void;
    winchStop: () => void;
    stopAll: () => void;
    emergencyStop: () => void;

    showPreset: () => void;
    returnToHome: () => void;

}

export const Controls: React.FC<ControlProps> = ({selectedPreset, length, settings, winchIn, winchOut, winchStop, stopAll, emergencyStop, showPreset, returnToHome}) => {
    return (
        <View style={{marginHorizontal: 20, marginTop: 10}}>
          <Text style={{fontSize: 32, fontWeight: "600", color: "#0A2543"}}>
            Live Data
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#0A2543"}}>
            Length: <Text style={{fontWeight: "400"}}>{length ? length + "m": "0m"}</Text>
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#0A2543"}}>
            Selected Preset: <Text style={{fontWeight: "400"}}>{selectedPreset ? selectedPreset.name + " (" + selectedPreset.length + "m)" : ("N/A")}</Text>
          </Text>

          <View style={{flexDirection: "row", alignItems: "center", marginTop: 40}}>
            <Text style={{fontSize: 32, fontWeight: "600", color: "#0A2543"}}>
                Actions
            </Text>
            <Pressable
                style={({ pressed }) => [
                {
                    backgroundColor: pressed ? "rgba(58, 147, 248, 0.3)" : "rgba(58, 147, 248, 0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 34,
                    borderRadius: 10,
                    marginLeft: "auto"
                },
                ]}
                onPress={showPreset}
            >
                <Text style={{ fontSize: 16, fontWeight: "400", color: "#0A2543", paddingVertical: 5, paddingHorizontal: 29}}>Presets</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#3485E0" : "#3A93F8",
                marginTop: 20,
                justifyContent: "center",
                alignItems: "center",
                height: 70,
                borderRadius: 18,
              },
            ]}
            onPressIn={winchIn}
            onPressOut={winchStop}
          >
            <Text style={{ fontSize: 25, color: "white" }}>Winch In</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#3485E0" : "#3A93F8",
                marginTop: 20,
                justifyContent: "center",
                alignItems: "center",
                height: 70,
                borderRadius: 18,
              },
            ]}
            onPressIn={winchOut}
            onPressOut={winchStop}
          >
            <Text style={{ fontSize: 25, color: "white" }}>Winch Out</Text>
          </Pressable>

            <View style={{marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8, display: settings.fine ? 'none' : 'flex'}}>
                <FontAwesome6 name="circle-info" size={20} color="#0A2543" />
                <Text style={{fontSize: 18, fontWeight: "400", color: "#0A2543"}}>Winch In/Out moves in {settings.interval}m intervals</Text>
            </View>

            <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "rgba(58, 147, 248, 0.3)" : "rgba(58, 147, 248, 0.2)",
                marginTop: 40,
                justifyContent: "center",
                alignItems: "center",
                height: 35,
                borderRadius: 10,
              },
            ]}
            onPress={returnToHome}
          >
            <Text style={{ fontSize: 16, color: "#0A2543" }}>Return to Home</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#E74545" : "#FF4C4C",
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                height: 70,
                borderRadius: 18,
              },
            ]}
            onPressIn={emergencyStop}
            onPressOut={() => {}}
          >
            <Text style={{ fontSize: 25, color: "white" }}>Emergency Stop</Text>
          </Pressable>
        </View>
    )
}