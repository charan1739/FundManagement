import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/app_colors.dart';
import 'core/router/app_router.dart';
import 'core/socket/socket_service.dart';
import 'core/socket/socket_provider.dart';
import 'features/auth/presentation/auth_provider.dart';
import 'features/notifications/presentation/notification_provider.dart';
import 'features/notifications/models/notification_model.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'core/notifications/push_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(const ProviderScope(child: FundManagerApp()));
}

class FundManagerApp extends ConsumerStatefulWidget {
  const FundManagerApp({super.key});

  @override
  ConsumerState<FundManagerApp> createState() => _FundManagerAppState();
}

class _FundManagerAppState extends ConsumerState<FundManagerApp> {
  @override
  void initState() {
    super.initState();
    _setupSocketListeners();
    // Initialize push notifications
    PushService.instance.init();
  }

  void _setupSocketListeners() {
    SocketService.instance.events.listen((evt) {
      if (!mounted) return;
      if (evt.event == SocketEvent.notificationNew) {
        // Increment badge and prepend notification
        try {
          final notif = NotificationModel.fromJson(evt.data);
          ref.read(notificationProvider.notifier).prependNotification(notif);
        } catch (_) {
          // If not parseable, just refresh
          ref.read(notificationProvider.notifier).refresh();
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Fund Manager',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        // Constrain font scaling to prevent layout breaks
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(textScaler: TextScaler.noScaling),
          child: child!,
        );
      },
    );
  }
}
