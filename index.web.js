import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('main', () => App);

if (module.hot) {
  module.hot.accept();
} 