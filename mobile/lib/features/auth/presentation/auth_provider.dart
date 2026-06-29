import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/socket/socket_service.dart';
import '../../../core/network/dio_client.dart';
import '../models/user_model.dart';
import '../data/auth_repository.dart';
import '../../groups/presentation/group_provider.dart';
import '../../requests/presentation/request_provider.dart';
import '../../funds/presentation/fund_provider.dart';

final authRepoProvider = Provider<AuthRepository>((ref) => AuthRepository());

class AuthNotifier extends AsyncNotifier<UserModel?> {
  @override
  Future<UserModel?> build() async {
    // Try to restore session from secure storage
    final token = await SecureStorage.instance.getAccessToken();
    if (token == null) return null;
    try {
      final res = await DioClient.instance.dio.get('/profile');
      final user = UserModel.fromJson(res.data['data'] as Map<String, dynamic>);
      SocketService.instance.connect(token, user.id);
      return user;
    } catch (_) {
      await SecureStorage.instance.clearAll();
      return null;
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    try {
      final repo = ref.read(authRepoProvider);
      final data = await repo.login(email, password);
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      await SecureStorage.instance.saveTokens(
        access: data['accessToken'] as String,
        refresh: data['refreshToken'] as String?,
      );
      await SecureStorage.instance.saveUser(jsonEncode(user.toJson()));
      SocketService.instance.connect(data['accessToken'] as String, user.id);
      state = AsyncData(user);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
      rethrow;
    }
  }

  Future<void> register({
    required String name, required String email,
    required String username, required String password,
  }) async {
    state = const AsyncLoading();
    try {
      final repo = ref.read(authRepoProvider);
      final data = await repo.register(name: name, email: email, username: username, password: password);
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      await SecureStorage.instance.saveTokens(
        access: data['accessToken'] as String,
        refresh: data['refreshToken'] as String?,
      );
      await SecureStorage.instance.saveUser(jsonEncode(user.toJson()));
      SocketService.instance.connect(data['accessToken'] as String, user.id);
      state = AsyncData(user);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
      rethrow;
    }
  }

  Future<void> logout() async {
    // Clear tokens FIRST so the logout API call goes without a token,
    // preventing the AuthInterceptor from retrying on a 401.
    SocketService.instance.disconnect();
    await SecureStorage.instance.clearAll();

    // Fire-and-forget the server-side logout (best effort)
    try { await ref.read(authRepoProvider).logout(); } catch (_) {}

    _clearProviders();
    state = const AsyncData(null);
  }

  /// Called by AuthInterceptor when a 401 is detected outside of auth flows.
  /// Does NOT call the logout API again (token already gone), just clears state.
  Future<void> forceLogout() async {
    SocketService.instance.disconnect();
    await SecureStorage.instance.clearAll();
    _clearProviders();
    state = const AsyncData(null);
  }

  void _clearProviders() {
    // NOTE: notificationProvider is intentionally NOT invalidated here.
    // It watches authProvider.future directly and will rebuild to [] automatically
    // when auth state becomes null. Invalidating it here creates a circular dependency.
    ref.invalidate(homeProvider);
    ref.invalidate(myRequestsProvider);
    ref.invalidate(groupDetailProvider);
    ref.invalidate(membersProvider);
    ref.invalidate(requestProvider);
    ref.invalidate(requestDetailProvider);
    ref.invalidate(transactionProvider);
    ref.invalidate(activityProvider);
  }

  Future<void> updateUser(UserModel user) async {
    await SecureStorage.instance.saveUser(jsonEncode(user.toJson()));
    state = AsyncData(user);
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, UserModel?>(() => AuthNotifier());
