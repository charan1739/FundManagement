import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/profile_repository.dart';
import '../../auth/models/user_model.dart';

final profileRepoProvider = Provider<ProfileRepository>((ref) => ProfileRepository());

class ProfileNotifier extends AsyncNotifier<UserModel?> {
  @override
  Future<UserModel?> build() async {
    try {
      return ref.read(profileRepoProvider).getProfile();
    } catch (_) {
      return null;
    }
  }

  Future<UserModel> updateProfile({String? name, String? phone}) async {
    final updated = await ref.read(profileRepoProvider).updateProfile(name: name, phone: phone);
    state = AsyncData(updated);
    return updated;
  }

  Future<void> changePassword(String current, String newPwd) async {
    await ref.read(profileRepoProvider).changePassword(current, newPwd);
  }

  Future<void> deleteAccount() async {
    await ref.read(profileRepoProvider).deleteAccount();
  }
}

final profileProvider = AsyncNotifierProvider<ProfileNotifier, UserModel?>(() => ProfileNotifier());
