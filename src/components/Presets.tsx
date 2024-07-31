import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Dimensions, Pressable, Alert } from "react-native";
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PanGestureHandler } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Preset } from "../screens/Home/Home";
import uuid from 'react-native-uuid';
import { Settings } from "../state/BluetoothLowEnergy/BluetoothLeManager";

const { height } = Dimensions.get('window');

interface PresetsProps {
  visible: boolean;
  currentLength: number;
  onClose: () => void;
  setPreset: (preset: Preset) => void;
  settings: Settings;
}

const PresetsModal: React.FC<PresetsProps> = ({ visible, currentLength, onClose, setPreset, settings }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [selectedLength, setSelectedLength] = useState(1);
  const [showInputs, setShowInputs] = useState(false);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const storedPresets = await AsyncStorage.getItem("presets");
        if (storedPresets) {
          setPresets(JSON.parse(storedPresets));
        }
      } catch (error) {
        console.error("Error fetching presets:", error);
      }
    };

    fetchPresets();
  }, []);

  useEffect(() => {
    if (currentLength) {
        setSelectedLength(currentLength);
    }
  }, [currentLength])

  const storePresets = async (newPresets: Preset[]) => {
    try {
      await AsyncStorage.setItem("presets", JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error("Error storing presets:", error);
    }
  };

  const addPreset = () => {
    if (newPresetName) {
      const updatedPresets = [...presets, { id: String(uuid.v4()), name: newPresetName, length: selectedLength }];
      storePresets(updatedPresets);
      setNewPresetName("");
      setSelectedLength(1);
      setShowInputs(false); // Hide inputs after adding preset
    }
  };

  const confirmDeletePreset = (preset: Preset) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this preset?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deletePreset(preset),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const deletePreset = (preset: Preset) => {
    const updatedPresets = presets.filter(p => p.id !== preset.id);
    storePresets(updatedPresets);
  };

  const handleClick = (item: Preset) => {
    setPreset(item);
    onClose();
  }

  const handleGestureEnd = () => {
    runOnJS(onClose)(); // Close modal on swipe down
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
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
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <Text style={{fontSize: 32, fontWeight: "600", color: "#0A2543"}}>
                    Presets
                </Text>
                <Pressable
                    style={({ pressed }) => [
                    {
                        backgroundColor: showInputs ? (pressed ? "rgba(255, 76, 76, 0.3)" : "rgba(255, 76, 76, 0.2)") : (pressed ? "rgba(58, 147, 248, 0.3)" : "rgba(58, 147, 248, 0.2)"),
                        justifyContent: "center",
                        alignItems: "center",
                        height: 34,
                        borderRadius: 10,
                        marginLeft: "auto"
                    },
                    ]}
                    onPress={() => {
                        if (showInputs) {
                            setNewPresetName("");
                            setSelectedLength(1);
                        }
                        setShowInputs(!showInputs)
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: "400", color: showInputs ? "#FF4C4C" : "#0A2543", paddingVertical: 5, paddingHorizontal: 29}}>{showInputs ? 'Cancel': '+ Add'}</Text>
                </Pressable>
            </View>
          {showInputs && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Preset Name"
                value={newPresetName}
                onChangeText={setNewPresetName}
                returnKeyType="done" // This sets the return key to 'Done'
                blurOnSubmit={true}
                keyboardType="default" // Ensure the default keyboard is used
            
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Length: </Text>
                <Picker
                  selectedValue={selectedLength}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedLength(itemValue)}
                >
                  {[...Array(settings.length * 2).keys()].map((num) => (
                    <Picker.Item style={{color: "#0A2543"}}key={(num + 1)/2} label={`${(num + 1)/2}`} value={(num + 1)/2} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity style={styles.addPresetButton} onPress={addPreset}>
                <Text style={styles.buttonText}>Add Preset</Text>
              </TouchableOpacity>
            </>
          )}
          <FlatList
            data={presets}
            keyExtractor={(item) => item.name+item.length+Math.random()}
            style={{marginTop: 20}}
            renderItem={({ item }) => (
              <Pressable style={styles.presetItem} onPress={() => handleClick(item)}>
                <View>
                  <Text style={{fontSize: 24, fontWeight: "400", color: "#042543"}}>{item.name}</Text>
                  <Text style={{fontSize: 16, fontWeight: "400", color: "#042543"}}>Length: {item.length}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeletePreset(item)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </Pressable>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
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

export default PresetsModal;
