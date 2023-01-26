import { extendTheme, NativeBaseProvider, Text } from 'native-base';
import TodoApp from './src/TodoApp';
import { LinearGradient } from 'expo-linear-gradient';
import { store, persistor } from './src/redux/store';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Platform, UIManager } from 'react-native';
import { useEffect } from 'react';

const config = {
  dependencies: {
    'linear-gradient': LinearGradient
  }
};

export default function App() {

  const theme = extendTheme({
    config: {
      useSystemColorMode: false,
      initialColorMode: 'dark'
    },

    components:{
      Input: {
        baseStyle: {
          _focus: {
            _ios: {
              selectionColor: 'unset',
            },
            _android: {
              selectionColor: 'unset',
            },
          },
        },
      }
   }
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, [])
  

  return (
    <NativeBaseProvider theme={theme} config={config}>
      <ReduxProvider store={store}>
        <PersistGate loading={<Text>Loading... </Text>} persistor={persistor}>
          <TodoApp/>
        </PersistGate>
      </ReduxProvider>
    </NativeBaseProvider>
  );
}