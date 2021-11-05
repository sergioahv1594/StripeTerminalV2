import {NativeModules} from 'react-native';
import createHooks from './src/hooks';
import createConnectionService from './connectionService';

const {RNStripeTerminalV2} = NativeModules;

class StripeTerminal {
  // Device types
  DeviceTypeChipper2X = RNStripeTerminalV2.DeviceTypeChipper2X;

  // Discovery methods
  DiscoveryMethodBluetoothScan =
    RNStripeTerminalV2.DiscoveryMethodBluetoothScan;
  DiscoveryMethodBluetoothProximity =
    RNStripeTerminalV2.DiscoveryMethodBluetoothProximity;

  // Payment intent statuses
  PaymentIntentStatusRequiresPaymentMethod =
    RNStripeTerminalV2.PaymentIntentStatusRequiresPaymentMethod;
  PaymentIntentStatusRequiresConfirmation =
    RNStripeTerminalV2.PaymentIntentStatusRequiresConfirmation;
  PaymentIntentStatusRequiresCapture =
    RNStripeTerminalV2.PaymentIntentStatusRequiresCapture;
  PaymentIntentStatusCanceled = RNStripeTerminalV2.PaymentIntentStatusCanceled;
  PaymentIntentStatusSucceeded =
    RNStripeTerminalV2.PaymentIntentStatusSucceeded;

  // Reader events
  ReaderEventCardInserted = RNStripeTerminalV2.ReaderEventCardInserted;
  ReaderEventCardRemoved = RNStripeTerminalV2.ReaderEventCardRemoved;

  // Payment status
  PaymentStatusNotReady = RNStripeTerminalV2.PaymentStatusNotReady;
  PaymentStatusReady = RNStripeTerminalV2.PaymentStatusReady;
  PaymentStatusWaitingForInput =
    RNStripeTerminalV2.PaymentStatusWaitingForInput;
  PaymentStatusProcessing = RNStripeTerminalV2.PaymentStatusProcessing;

  // Connection status
  ConnectionStatusNotConnected =
    RNStripeTerminalV2.ConnectionStatusNotConnected;
  ConnectionStatusConnected = RNStripeTerminalV2.ConnectionStatusConnected;
  ConnectionStatusConnecting = RNStripeTerminalV2.ConnectionStatusConnecting;

  // Fetch connection token. Overwritten in call to initialize
  _fetchConnectionToken = () =>
    Promise.reject('You must initialize RNStripeTerminal first.');

  constructor() {
    this.listener = new NativeEventEmitter(RNStripeTerminalV2);

    this.listener.addListener(
      'requestConnectionToken',
      function () {
        this._fetchConnectionToken()
          .then((token) => {
            if (token) {
              RNStripeTerminalV2.setConnectionToken(token, null);
            } else {
              throw new Error(
                'User-supplied `fetchConnectionToken` resolved successfully, but no token was returned.',
              );
            }
          })
          .catch((err) =>
            RNStripeTerminalV2.setConnectionToken(
              null,
              err.message || 'Error in user-supplied `fetchConnectionToken`.',
            ),
          );
      }.bind(this),
    );

    this._createListeners([
      'log',
      'readersDiscovered',
      'readerSoftwareUpdateProgress',
      'didRequestReaderInput',
      'didRequestReaderInputPrompt',
      'didRequestReaderDisplayMessage',
      'didReportReaderEvent',
      'didReportLowBatteryWarning',
      'didChangePaymentStatus',
      'didChangeConnectionStatus',
      'didReportUnexpectedReaderDisconnect',
      'didBeginWaitingForReaderInput',
      'didBeginWaitingForReaderPrompt',
    ]);
  }

  _createListeners(keys) {
    keys.forEach((k) => {
      this[`add${k[0].toUpperCase() + k.substring(1)}Listener`] = (listener) =>
        this.listener.addListener(k, listener);
      this[`remove${k[0].toUpperCase() + k.substring(1)}Listener`] = (
        listener,
      ) => this.listener.removeListener(k, listener);
    });
  }

  _wrapPromiseReturn(event, call, key) {
    return new Promise((resolve, reject) => {
      const subscription = this.listener.addListener(event, (data) => {
        if (data && data.error) {
          reject(data);
        } else {
          resolve(key ? data[key] : data);
        }
        subscription.remove();
      });

      call();
    });
  }

  initialize({fetchConnectionToken}) {
    this._fetchConnectionToken = fetchConnectionToken.bind(this);
    return new Promise((resolve, reject) => {
      if (Platform.OS == 'android') {
        RNStripeTerminalV2.initialize((status) => {
          if (status.isInitialized === true) {
            resolve();
          } else {
            reject(status.error);
          }
        });
      } else {
        RNStripeTerminalV2.initialize();
        resolve();
      }
    });
  }

  reinitialize() {
    RNStripeTerminalV2.clearCachedCredentials();
  }

  discoverReaders(deviceType, method, simulated) {
    return this._wrapPromiseReturn('readerDiscoveryCompletion', () => {
      RNStripeTerminalV2.discoverReaders(deviceType, method, simulated);
    });
  }

  checkForUpdate() {
    return this._wrapPromiseReturn('updateCheck', () => {
      RNStripeTerminalV2.checkForUpdate();
    });
  }

  installUpdate() {
    return this._wrapPromiseReturn('updateInstall', () => {
      RNStripeTerminalV2.installUpdate();
    });
  }

  connectReader(serialNumber) {
    return this._wrapPromiseReturn('readerConnection', () => {
      RNStripeTerminalV2.connectReader(serialNumber);
    });
  }

  disconnectReader() {
    return this._wrapPromiseReturn('readerDisconnectCompletion', () => {
      RNStripeTerminalV2.disconnectReader();
    });
  }

  getConnectedReader() {
    return this._wrapPromiseReturn('connectedReader', () => {
      RNStripeTerminalV2.getConnectedReader();
    }).then((data) => (data.serialNumber ? data : null));
  }

  getConnectionStatus() {
    return this._wrapPromiseReturn('connectionStatus', () => {
      RNStripeTerminalV2.getConnectionStatus();
    });
  }

  getPaymentStatus() {
    return this._wrapPromiseReturn('paymentStatus', () => {
      RNStripeTerminalV2.getPaymentStatus();
    });
  }

  getLastReaderEvent() {
    return this._wrapPromiseReturn('lastReaderEvent', () => {
      RNStripeTerminalV2.getLastReaderEvent();
    });
  }

  createPayment(options) {
    return this._wrapPromiseReturn(
      'paymentCreation',
      () => {
        RNStripeTerminalV2.createPayment(options);
      },
      'intent',
    );
  }

  createPaymentIntent(options) {
    return this._wrapPromiseReturn(
      'paymentIntentCreation',
      () => {
        RNStripeTerminalV2.createPaymentIntent(options);
      },
      'intent',
    );
  }

  retrievePaymentIntent(clientSecret) {
    return this._wrapPromiseReturn(
      'paymentIntentRetrieval',
      () => {
        RNStripeTerminalV2.retrievePaymentIntent(clientSecret);
      },
      'intent',
    );
  }

  collectPaymentMethod() {
    return this._wrapPromiseReturn(
      'paymentMethodCollection',
      () => {
        RNStripeTerminalV2.collectPaymentMethod();
      },
      'intent',
    );
  }

  processPayment() {
    return this._wrapPromiseReturn(
      'paymentProcess',
      () => {
        RNStripeTerminalV2.processPayment();
      },
      'intent',
    );
  }

  cancelPaymentIntent() {
    return this._wrapPromiseReturn(
      'paymentIntentCancel',
      () => {
        RNStripeTerminalV2.cancelPaymentIntent();
      },
      'intent',
    );
  }

  readReusableCard() {
    return this._wrapPromiseReturn(
      'readReusableCard',
      () => {
        RNStripeTerminalV2.readReusableCard();
      },
      'method',
    );
  }

  abortCreatePayment() {
    return this._wrapPromiseReturn('abortCreatePaymentCompletion', () => {
      RNStripeTerminalV2.abortCreatePayment();
    });
  }

  abortDiscoverReaders() {
    return this._wrapPromiseReturn('abortDiscoverReadersCompletion', () => {
      RNStripeTerminalV2.abortDiscoverReaders();
    });
  }

  abortInstallUpdate() {
    return this._wrapPromiseReturn('abortInstallUpdateCompletion', () => {
      RNStripeTerminalV2.abortInstallUpdate();
    });
  }

  abortReadPaymentMethod() {
    return this._wrapPromiseReturn('abortReadPaymentMethod', () => {
      RNStripeTerminalV2.abortReadPaymentMethod();
    });
  }

  startService(options) {
    if (typeof options === 'string') {
      options = {policy: options};
    }

    if (this._currentService) {
      return this._currentService;
    }

    this._currentService = createConnectionService(this, options);
    this._currentService.start();
    return this._currentService;
  }

  stopService() {
    if (!this._currentService) {
      return Promise.resolve();
    }

    return this._currentService.stop().then(() => {
      this._currentService = null;
    });
  }

  cleanReadersDiscoveredListener() {
    if (!this._currentService) {
      return Promise.resolve();
    }

    return this._currentService.cleanReadersDiscoveredListener();
  }
}

const StripeTerminal_ = new StripeTerminal();
export default StripeTerminal_;

export const {
  useStripeTerminalState,
  useStripeTerminalCreatePayment,
  useStripeTerminalReadPaymentMethod,
  useStripeTerminalConnectionManager,
} = createHooks(StripeTerminal_);
