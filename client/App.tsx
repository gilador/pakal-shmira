import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import useCachedResources from "./src/hooks/useCachedResources";
import Navigation from "./src/navigation";
import { useFonts } from 'expo-font';



export default function App() {
  const isLoadingComplete = useCachedResources();
    const [fontsLoaded] = useFonts({
        'gilroy-extra-bold': require('./src/assets/fonts/Gilroy-ExtraBold.otf'),
        'gilroy-light': require('./src/assets/fonts/Gilroy-Light.otf'),
        'baba-dots-fm': require('./src/assets/fonts/baba-dots-fm.otf'),
        'Dafavohebfont-Regular': require('./src/assets/fonts/Dafavohebfont-Regular.ttf'),
    });

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation/>
        <StatusBar/>
      </SafeAreaProvider>
    );
  }
}
