import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/notification_repository.dart';
import '../models/notification_model.dart';
import '../../auth/presentation/auth_provider.dart';

final notificationRepoProvider = Provider<NotificationRepository>((ref) => NotificationRepository());

class NotificationNotifier extends AsyncNotifier<List<NotificationModel>> {
  @override
  Future<List<NotificationModel>> build() async {
    // Don't fetch if not authenticated — prevents 401 cascade on logout
    final user = await ref.watch(authProvider.future);
    if (user == null) return [];
    return _fetchAll();
  }

  Future<List<NotificationModel>> _fetchAll() async {
    final repo = ref.read(notificationRepoProvider);
    final data = await repo.getNotifications();
    final list = data['data'] as List;
    return list.map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetchAll);
  }

  int get unreadCount {
    return state.valueOrNull?.where((n) => !n.read).length ?? 0;
  }

  Future<void> markRead(String id) async {
    final repo = ref.read(notificationRepoProvider);
    await repo.markRead(id);
    state = AsyncData(
      state.valueOrNull?.map((n) => n.id == id ? n.copyWith(read: true) : n).toList() ?? [],
    );
  }

  Future<void> markAllRead() async {
    final repo = ref.read(notificationRepoProvider);
    await repo.markAllRead();
    state = AsyncData(
      state.valueOrNull?.map((n) => n.copyWith(read: true)).toList() ?? [],
    );
  }

  void prependNotification(NotificationModel notif) {
    final current = state.valueOrNull ?? [];
    state = AsyncData([notif, ...current]);
  }
}

final notificationProvider = AsyncNotifierProvider<NotificationNotifier, List<NotificationModel>>(
  () => NotificationNotifier(),
);

final unreadCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationProvider);
  return notifications.valueOrNull?.where((n) => !n.read).length ?? 0;
});
