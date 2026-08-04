import { View } from "react-native";
import Home from '@/screens/Home';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Index() {
  return (
    <GestureHandlerRootView>
        <View
          style={{
            flex: 1,
          }}
        >
          <Home />
        </View>
    </GestureHandlerRootView>
  );
}
