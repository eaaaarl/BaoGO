import AuthProvider from "@/components/AuthProvider";
import { store as ReduxStore } from "@/libs/redux/store";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import "../global.css";

const persistor = persistStore(ReduxStore);

export default function RootLayout() {
  return (
    <Provider store={ReduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        <KeyboardProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </KeyboardProvider>
      </PersistGate>
    </Provider>
  );
}
