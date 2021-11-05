import Foundation
import StripeTerminal

@objc(RNStripeTerminalV2)
class RNStripeTerminalV2 : NSObject, ConnectionTokenProvider,DiscoveryDelegate, TerminalDelegate, BluetoothReaderDelegate {

  
  private var pendingConnectionTokenCompletionBlock: ConnectionTokenCompletionBlock?
  private let eventEmitter: EventEmitter = EventEmitter()
  private var readers: [Reader] = []
  
  
  
  // MARK: DiscoveryDelegate
  
  public func terminal(_: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
     self.readers = readers

     let readersJSON = readers.map {
         (reader: Reader) -> [String: Any] in
         StripeTerminalUtils.serializeReader(reader: reader)
     }

    self.eventEmitter.sendEvent(withName: "readersDiscovered", body: readersJSON)
  }
  
  func reader(_ reader: Reader, didReportAvailableUpdate update: ReaderSoftwareUpdate) {
    
  }
  
  func reader(_ reader: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
    
  }
  
  func reader(_ reader: Reader, didReportReaderSoftwareUpdateProgress progress: Float) {
    
  }
  
  func reader(_ reader: Reader, didFinishInstallingUpdate update: ReaderSoftwareUpdate?, error: Error?) {
    
  }
  
  func reader(_ reader: Reader, didRequestReaderInput inputOptions: ReaderInputOptions = []) {
    
  }
  
  func reader(_ reader: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
    
  }
  
  
  // MARK: TerminalDelegate
  
  func terminal(_ terminal: Terminal, didReportUnexpectedReaderDisconnect reader: Reader) {
//    logMsg(items: "didReportUnexpectedReaderDisconnect \(reader)")
//    notifyListeners("didReportUnexpectedReaderDisconnect", data: ["reader": StripeTerminalUtils.serializeReader(reader: reader)])
  }
  
  
 
  
  func onLogEntry(logline : String) {
    self.eventEmitter.sendEvent(withName: "log", body: logline)
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
      return false
  }
  
  // Reference to use main thread
  @objc func open(_ options: NSDictionary) -> Void {
    DispatchQueue.main.async {
      self._open(options: options)
    }
  }
  
  func _open(options: NSDictionary) -> Void {
    var items = [String]()
    let message = RCTConvert.nsString(options["message"])
    
    if message != "" {
      items.append(message!)
    }
    
    if items.count == 0 {
      print("No `message` to share!")
      return
    }
    
    let controller = RCTPresentedViewController();
    let shareController = UIActivityViewController(activityItems: items, applicationActivities: nil);
    
    shareController.popoverPresentationController?.sourceView = controller?.view;
    
    controller?.present(shareController, animated: true, completion: nil)
  }
  
  func initialize(token: ConnectionTokenProvider) -> Void {
    Terminal.setTokenProvider(self)
    Terminal.shared.delegate = self
    Terminal.setLogListener { logline in
        self.onLogEntry(logline: logline)
    }
    // To log events from the SDK to the console:
     Terminal.shared.logLevel = .verbose
    
//    self.cancelDiscoverReaders()
//    self.cancelInstallUpdate()
    
  }
  
  
  func fetchConnectionToken(_ completion: @escaping ConnectionTokenCompletionBlock) -> Void {
    pendingConnectionTokenCompletionBlock = completion
    self.eventEmitter.sendEvent(withName: "requestConnectionToken", body: [:])
  }
  
  @objc func setConnectionToken(token : String, errorMessage: String) {
    if let completion = pendingConnectionTokenCompletionBlock {
        if !errorMessage.isEmpty {
            let error = NSError(domain: "io.event1.capacitor-stripe-terminal",
                                code: 1,
                                userInfo: [NSLocalizedDescriptionKey: errorMessage])
            completion(nil, error)
        } else {
            completion(token, nil)
        }

        pendingConnectionTokenCompletionBlock = nil
    }
  }
  
  
//  @objc func cancelDiscoverReaders(_ call: CAPPluginCall? = nil) {
//         if let cancelable = pendingDiscoverReaders {
//             cancelable.cancel { error in
//                 if let error = error {
//                     call?.reject(error.localizedDescription, nil, error)
//                 } else {
//                     call?.resolve()
//                 }
//             }
//
//             return
//         }
//
//         call?.resolve()
//     }
}
