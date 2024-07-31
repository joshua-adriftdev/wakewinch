import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "./screens/Home/Home";
import { Notify } from "./screens/Notify/Notify";
import { Read } from "./screens/Read/Read";
import { Write } from "./screens/Write/Write";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { ConnectA } from "./screens/Connect/Connect";
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
          <Stack.Screen name="Notify" component={Notify} />
          <Stack.Screen name="Read" component={Read} />
          <Stack.Screen name="Write" component={Write} />
          <Stack.Screen
            name="Connect"
            component={ConnectA}
            options={{ presentation: "modal" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
    </GestureHandlerRootView>
    
  );
};

export default App;