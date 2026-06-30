import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../network/dio_client.dart';

class PushService {
  PushService._();
  static final PushService instance = PushService._();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> init() async {
    // Request permissions (primarily for iOS)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('[FCM] User granted permission');
    } else {
      debugPrint('[FCM] User declined or has not accepted permission');
    }

    // Get the FCM token and send it to the backend
    try {
      final token = await _fcm.getToken();
      if (token != null) {
        await _registerTokenWithBackend(token);
      }
      
      // Listen for token refreshes
      _fcm.onTokenRefresh.listen(_registerTokenWithBackend);
    } catch (e) {
      debugPrint('[FCM] Failed to get token: $e');
    }
  }

  Future<void> _registerTokenWithBackend(String token) async {
    try {
      debugPrint('[FCM] Registering token: $token');
      // Sends the token to the backend. We'll ignore 401s if the user isn't logged in yet,
      // and we'll re-register it upon login.
      await DioClient.instance.dio.patch('/profile/fcm-token', data: {
        'token': token,
      });
    } catch (e) {
      debugPrint('[FCM] Failed to register token with backend');
    }
  }

  Future<void> registerToken() async {
    try {
      final token = await _fcm.getToken();
      if (token != null) {
        await _registerTokenWithBackend(token);
      }
    } catch (_) {}
  }
}
