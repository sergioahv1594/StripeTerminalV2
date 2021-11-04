import React from 'react';
import {Button, SafeAreaView, StatusBar} from 'react-native';
import RNStripeTerminalV2 from './native/RNStripeTerminalV2';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <Button
        title="Share"
        onPress={() => RNStripeTerminalV2.open({message: 'Message to share'})}
      />
    </SafeAreaView>
  );
};

export default App;
