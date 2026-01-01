/**
 * @format
 */
import 'react-native-get-random-values';
import 'react-native-gesture-handler'; // Required for Android
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

console.log('--- JS INDEX STARTING ---');
AppRegistry.registerComponent(appName, () => {
  console.log('--- REGISTERING COMPONENT ---');
  return App;
});
