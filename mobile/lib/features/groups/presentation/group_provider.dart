import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/group_repository.dart';
import '../models/group_model.dart';
import '../models/member_model.dart';

final groupRepoProvider = Provider<GroupRepository>((ref) => GroupRepository());

// Home: all user groups + pending invites
class HomeNotifier extends AsyncNotifier<({List<GroupModel> groups, List<InviteModel> invites})> {
  @override
  Future<({List<GroupModel> groups, List<InviteModel> invites})> build() async {
    return _fetch();
  }

  Future<({List<GroupModel> groups, List<InviteModel> invites})> _fetch() async {
    final repo = ref.read(groupRepoProvider);
    final results = await Future.wait([repo.getMyGroups(), repo.getPendingInvites()]);
    return (groups: results[0] as List<GroupModel>, invites: results[1] as List<InviteModel>);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  Future<void> createGroup(String name, {String? description}) async {
    await ref.read(groupRepoProvider).createGroup(name, description: description);
    await refresh();
  }

  Future<void> acceptInvite(String groupId) async {
    await ref.read(groupRepoProvider).acceptInvite(groupId);
    await refresh();
  }

  Future<void> declineInvite(String groupId) async {
    await ref.read(groupRepoProvider).declineInvite(groupId);
    await refresh();
  }

  Future<void> joinByCode(String code) async {
    await ref.read(groupRepoProvider).joinByCode(code);
    await refresh();
  }
}

final homeProvider =
    AsyncNotifierProvider<HomeNotifier, ({List<GroupModel> groups, List<InviteModel> invites})>(() => HomeNotifier());

// Single group detail
class GroupDetailNotifier extends FamilyAsyncNotifier<GroupModel, String> {
  @override
  Future<GroupModel> build(String groupId) async {
    return ref.read(groupRepoProvider).getGroup(groupId);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(groupRepoProvider).getGroup(arg));
  }
}

final groupDetailProvider =
    AsyncNotifierProviderFamily<GroupDetailNotifier, GroupModel, String>(() => GroupDetailNotifier());

// Members per group
class MembersNotifier extends FamilyAsyncNotifier<List<MemberModel>, String> {
  @override
  Future<List<MemberModel>> build(String groupId) async {
    return ref.read(groupRepoProvider).getMembers(groupId);
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => ref.read(groupRepoProvider).getMembers(arg));
  }

  Future<void> remove(String userId) async {
    await ref.read(groupRepoProvider).removeMember(arg, userId);
    await refresh();
  }

  Future<void> invite(String emailOrUsername) async {
    await ref.read(groupRepoProvider).inviteMember(arg, emailOrUsername);
    await refresh();
  }
}

final membersProvider =
    AsyncNotifierProviderFamily<MembersNotifier, List<MemberModel>, String>(() => MembersNotifier());
