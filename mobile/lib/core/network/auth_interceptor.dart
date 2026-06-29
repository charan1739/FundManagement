import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../constants/api_constants.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../router/app_router.dart';
import '../../features/auth/presentation/auth_provider.dart';

/// Paths that should NEVER trigger a 401-retry/refresh cycle.
/// These are auth endpoints that legitimately may return 401 when
/// the token has already been cleared.
const _skipRetryPaths = [
  ApiConstants.login,
  ApiConstants.register,
  ApiConstants.logout,
  ApiConstants.refreshToken,
];

class AuthInterceptor extends Interceptor {
  final Dio _dio;
  bool _isRefreshing = false;

  AuthInterceptor(this._dio);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await SecureStorage.instance.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final path = err.requestOptions.path;
    // Never retry 401s for auth-related endpoints — avoids infinite loop
    final isSkipped = _skipRetryPaths.any((p) => path.contains(p));

    if (err.response?.statusCode == 401 && !_isRefreshing && !isSkipped) {
      _isRefreshing = true;
      try {
        final rf = await SecureStorage.instance.getRefreshToken();
        if (rf != null) {
          final response = await _dio.post(
            ApiConstants.refreshToken,
            data: {'refreshToken': rf},
            options: Options(headers: {}),
          );
          final newToken = response.data['data']['accessToken'] as String;
          final newRefresh = response.data['data']['refreshToken'] as String?;
          await SecureStorage.instance.saveTokens(
            access: newToken,
            refresh: newRefresh,
          );
          // Retry original request with new token
          err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
          final retried = await _dio.fetch(err.requestOptions);
          handler.resolve(retried);
          return;
        }
      } catch (_) {
        // Refresh failed — clear and redirect to login
      } finally {
        _isRefreshing = false;
      }

      // Clear storage and redirect — only if not already logged out
      final existingToken = await SecureStorage.instance.getAccessToken();
      if (existingToken != null) {
        await SecureStorage.instance.clearAll();
      }
      if (rootNavigatorKey.currentContext != null) {
        final ctx = rootNavigatorKey.currentContext!;
        // Use GoRouter.of() — NOT GoRouterState.of() which requires a RouteBase
        // descendant context and crashes when called from the interceptor.
        final router = GoRouter.of(ctx);
        final currentLoc = router.routeInformationProvider.value.uri.path;
        if (currentLoc != '/login') {
          Future.microtask(() async {
            try {
              await ProviderScope.containerOf(ctx)
                  .read(authProvider.notifier)
                  .forceLogout();
            } catch (_) {}
            router.go('/login');
          });
        }
      }
    }
    handler.next(err);
  }
}
