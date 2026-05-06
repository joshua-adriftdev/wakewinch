import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "./screens/Home/Home";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { requestPermissions } from "./state/BluetoothLowEnergy/utils";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const App = () => {
  useEffect(() => {
    requestPermissions();
  }, []);

  const Stack = createNativeStackNavigator();
  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
    </GestureHandlerRootView>
    
  );
};

export default App;