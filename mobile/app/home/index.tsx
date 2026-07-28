import { View } from "react-native";
import Home from '@/screens/Home';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HomeContextProvider } from "./context";

export default function Index() {
  return (
    <GestureHandlerRootView>
      <HomeContextProvider>
        <View
          style={{
            flex: 1,
          }}
        >
          <Home />
        </View>
      </HomeContextProvider>
    </GestureHandlerRootView>
  );
}
