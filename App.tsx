import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { theme } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { cacheService } from './src/services/cacheService';

function App(): React.JSX.Element {
  React.useEffect(() => {
    cacheService.init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <AppNavigator />
          </PaperProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
