//
//  EventEmitter.swift
//  StripeTerminalV2
//
//  Created by Sergio Herrera on 11/4/21.
//

import Foundation

@objc(EventEmitter)
class EventEmitter: RCTEventEmitter {

    public static var shared:EventEmitter?

    override init() {
        super.init()
        EventEmitter.shared = self
    }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
      return true
  }

    override func supportedEvents() -> [String]! {
        return [
          "log",
          "requestConnectionToken",
          "readersDiscovered",
          "readerSoftwareUpdateProgress",
          "readerDiscoveryCompletion",
          "readerDisconnectCompletion",
          "readerConnection",
          "updateCheck",
          "updateInstall",
          "paymentCreation",
          "paymentIntentCreation",
          "paymentIntentRetrieval",
          "paymentMethodCollection",
          "paymentProcess",
          "paymentIntentCancel",
          "didBeginWaitingForReaderInput",
          "didRequestReaderInput",
          "didRequestReaderDisplayMessage",
          "didReportReaderEvent",
          "didReportUnexpectedReaderDisconnect",
          "didReportLowBatteryWarning",
          "didChangePaymentStatus",
          "didChangeConnectionStatus",
          "didDisconnectUnexpectedlyFromReader",
          "connectedReader",
          "connectionStatus",
          "paymentStatus",
          "lastReaderEvent",
          "abortCreatePaymentCompletion",
          "abortDiscoverReadersCompletion",
          "abortInstallUpdateCompletion",
          "abortReadPaymentMethod",
          "readReusableCard"
          ];
    }
}
