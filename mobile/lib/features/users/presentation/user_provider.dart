import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/models/user_model.dart';
import '../data/user_repository.dart';

final userRepositoryProvider = Provider((ref) => UserRepository());

final userSearchProvider = StateNotifierProvider.autoDispose<UserSearchNotifier, AsyncValue<List<UserModel>>>((ref) {
  return UserSearchNotifier(ref.watch(userRepositoryProvider));
});

class UserSearchNotifier extends StateNotifier<AsyncValue<List<UserModel>>> {
  final UserRepository _repo;
  
  UserSearchNotifier(this._repo) : super(const AsyncData([]));

  Future<void> search(String query) async {
    if (query.trim().length < 2) {
      state = const AsyncData([]);
      return;
    }
    
    state = const AsyncLoading();
    try {
      final results = await _repo.searchUsers(query);
      state = AsyncData(results);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }
  
  void clear() {
    state = const AsyncData([]);
  }
}
