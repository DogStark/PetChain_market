# Mobile SDK Documentation

## Overview
This SDK provides a comprehensive set of tools for integrating with our mobile-optimized API. It handles API versioning, offline synchronization, push notifications, and response optimization.

## Installation

### iOS (Swift)
```swift
// Add to your Podfile
pod 'PetChainSDK'

// Install dependencies
pod install
```

### Android (Kotlin)
```gradle
// Add to your build.gradle
implementation 'com.petchain:sdk:1.0.0'
```

## Configuration

### iOS
```swift
import PetChainSDK

// Initialize SDK
let config = SDKConfig(
    apiKey: "your-api-key",
    environment: .production
)
PetChainSDK.initialize(config)
```

### Android
```kotlin
import com.petchain.sdk.PetChainSDK

// Initialize SDK
val config = SDKConfig.Builder()
    .setApiKey("your-api-key")
    .setEnvironment(Environment.PRODUCTION)
    .build()
PetChainSDK.initialize(config)
```

## Features

### API Versioning
The SDK automatically handles API versioning. You can specify the minimum required version:

```swift
// iOS
PetChainSDK.setMinimumApiVersion(2)
```

```kotlin
// Android
PetChainSDK.setMinimumApiVersion(2)
```

### Offline Synchronization
The SDK provides built-in offline support:

```swift
// iOS
let syncManager = PetChainSDK.syncManager
syncManager.enableOfflineSync()
syncManager.setSyncInterval(300) // 5 minutes
```

```kotlin
// Android
val syncManager = PetChainSDK.getSyncManager()
syncManager.enableOfflineSync()
syncManager.setSyncInterval(300) // 5 minutes
```

### Push Notifications
Register for push notifications:

```swift
// iOS
PetChainSDK.registerForPushNotifications { token in
    print("Push token: \(token)")
}
```

```kotlin
// Android
PetChainSDK.registerForPushNotifications { token ->
    println("Push token: $token")
}
```

### Response Optimization
The SDK automatically optimizes API responses:

```swift
// iOS
PetChainSDK.setResponseOptimization(true)
PetChainSDK.setImageCompressionQuality(0.8)
```

```kotlin
// Android
PetChainSDK.setResponseOptimization(true)
PetChainSDK.setImageCompressionQuality(0.8f)
```

## Error Handling

### iOS
```swift
PetChainSDK.setErrorHandler { error in
    switch error {
    case .networkError:
        // Handle network error
    case .syncConflict:
        // Handle sync conflict
    case .versionMismatch:
        // Handle version mismatch
    }
}
```

### Android
```kotlin
PetChainSDK.setErrorHandler { error ->
    when (error) {
        is NetworkError -> {
            // Handle network error
        }
        is SyncConflict -> {
            // Handle sync conflict
        }
        is VersionMismatch -> {
            // Handle version mismatch
        }
    }
}
```

## Best Practices

1. **Network Handling**
   - Always check for network connectivity before making requests
   - Use the built-in retry mechanism for failed requests
   - Implement proper error handling

2. **Offline Support**
   - Enable offline sync for critical features
   - Handle sync conflicts appropriately
   - Implement proper conflict resolution strategies

3. **Push Notifications**
   - Request notification permissions at appropriate times
   - Handle notification tokens properly
   - Implement proper notification handling

4. **Performance**
   - Use response optimization for better performance
   - Implement proper caching strategies
   - Monitor and optimize image loading

## Troubleshooting

### Common Issues

1. **Sync Conflicts**
   - Check the sync logs for conflict details
   - Implement proper conflict resolution
   - Consider using the built-in conflict resolution strategies

2. **Push Notification Issues**
   - Verify notification permissions
   - Check token registration
   - Ensure proper notification handling

3. **Performance Issues**
   - Enable response optimization
   - Check network conditions
   - Monitor memory usage

## Support

For additional support:
- Email: support@petchain.com
- Documentation: https://docs.petchain.com
- GitHub: https://github.com/petchain/sdk 