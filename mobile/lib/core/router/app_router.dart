import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../core/storage/secure_storage.dart';
import '../../core/theme/app_colors.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/presentation/auth_provider.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/groups/presentation/group_detail_screen.dart';
import '../../features/funds/presentation/add_fund_screen.dart';
import '../../features/requests/presentation/raise_request_screen.dart';
import '../../features/requests/presentation/manage_requests_screen.dart';
import '../../features/requests/presentation/request_detail_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/profile/presentation/change_password_screen.dart';
import '../../features/profile/presentation/my_requests_screen.dart';
import '../../features/notifications/presentation/notification_provider.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

/// A [ChangeNotifier] that bridges Riverpod's [authProvider] to GoRouter's
/// [refreshListenable], so the router re-evaluates redirects whenever auth
/// state changes (login / logout / session restore).
class _AuthStateNotifier extends ChangeNotifier {
  _AuthStateNotifier(this._ref) {
    _ref.listen<AsyncValue<dynamic>>(authProvider, (_, __) {
      notifyListeners();
    });
  }
  final Ref _ref;
}

final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = _AuthStateNotifier(ref);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/home',
    refreshListenable: authNotifier,
    redirect: (context, state) async {
      final token = await SecureStorage.instance.getAccessToken();
      final isAuth = token != null;
      final onAuthPage = state.matchedLocation == '/login' || state.matchedLocation == '/register';
      if (!isAuth && !onAuthPage) return '/login';
      if (isAuth && onAuthPage) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (ctx, _) => const LoginScreen()),
      GoRoute(path: '/register', builder: (ctx, _) => const RegisterScreen()),
      ShellRoute(
        navigatorKey: _shellKey,
        builder: (ctx, state, child) => _Shell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (ctx, _) => const HomeScreen()),
          GoRoute(path: '/notifications', builder: (ctx, _) => const NotificationsScreen()),
          GoRoute(path: '/profile', builder: (ctx, _) => const ProfileScreen()),
        ],
      ),
      // Full-screen routes (no shell nav)
      GoRoute(path: '/profile/edit', builder: (ctx, _) => const EditProfileScreen()),
      GoRoute(path: '/profile/password', builder: (ctx, _) => const ChangePasswordScreen()),
      GoRoute(path: '/profile/requests', builder: (ctx, _) => const MyRequestsScreen()),
      GoRoute(path: '/groups/:groupId', builder: (ctx, state) => GroupDetailScreen(groupId: state.pathParameters['groupId']!)),
      GoRoute(path: '/groups/:groupId/add-fund', builder: (ctx, state) => AddFundScreen(groupId: state.pathParameters['groupId']!)),
      GoRoute(path: '/groups/:groupId/requests/raise', builder: (ctx, state) => RaiseRequestScreen(groupId: state.pathParameters['groupId']!)),
      GoRoute(path: '/groups/:groupId/requests/manage', builder: (ctx, state) => ManageRequestsScreen(groupId: state.pathParameters['groupId']!)),
      GoRoute(path: '/requests/:requestId', builder: (ctx, state) => RequestDetailScreen(requestId: state.pathParameters['requestId']!)),
    ],
  );
});


// Shell with bottom nav
class _Shell extends ConsumerWidget {
  final Widget child;
  const _Shell({required this.child});

  static const _tabs = ['/home', '/notifications', '/profile'];
  static const _icons = [LucideIcons.home, LucideIcons.bell, LucideIcons.circleUser];
  static const _labels = ['Home', 'Notifications', 'Profile'];

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _tabs.length; i++) {
      if (loc.startsWith(_tabs[i])) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final idx = _currentIndex(context);
    final unread = ref.watch(unreadCountProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.accent, width: 1))),
        child: BottomNavigationBar(
          currentIndex: idx,
          onTap: (i) => context.go(_tabs[i]),
          items: List.generate(_tabs.length, (i) => BottomNavigationBarItem(
            icon: Stack(clipBehavior: Clip.none, children: [
              Icon(_icons[i]),
              if (i == 1 && unread > 0)
                Positioned(
                  top: -4, right: -8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                    decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(10)),
                    child: Text('${unread > 99 ? '99+' : unread}', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white)),
                  ),
                ),
            ]),
            label: _labels[i],
          )),
        ),
      ),
    );
  }
}
