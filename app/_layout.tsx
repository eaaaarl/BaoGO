import { store as ReduxStore } from "@/libs/redux/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import "../global.css";

const persistor = persistStore(ReduxStore);

export default function RootLayout() {
  return (
    <Provider store={ReduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }} />
      </PersistGate>
    </Provider>
  );
}
