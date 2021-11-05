#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "React/RCTConvert.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(RNStripeTerminalV2, NSObject)

RCT_EXTERN_METHOD(open:(NSDictionary *)options)
RCT_EXTERN_METHOD(initialize)
RCT_EXTERN_METHOD(setConnectionToken:(NSString *)token error:(NSString *)errorMessage)

@end

@interface RCT_EXTERN_MODULE(EventEmitter, RCTEventEmitter)

RCT_EXTERN_METHOD(supportedEvents)

@end
