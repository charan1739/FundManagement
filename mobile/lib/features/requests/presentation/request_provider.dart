import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/request_repository.dart';
import '../models/fund_request_model.dart';

final requestRepoProvider = Provider<RequestRepository>((ref) => RequestRepository());

class RequestNotifier extends FamilyAsyncNotifier<List<FundRequestModel>, String> {
  @override
  Future<List<FundRequestModel>> build(String groupId) async {
    return ref.read(requestRepoProvider).getGroupRequests(groupId);
  }

  Future<void> refresh({String? status}) async {
    state = await AsyncValue.guard(
      () => ref.read(requestRepoProvider).getGroupRequests(arg, status: status),
    );
  }

  Future<void> filterByStatus(String? status) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(requestRepoProvider).getGroupRequests(arg, status: status),
    );
  }
}

final requestProvider =
    AsyncNotifierProviderFamily<RequestNotifier, List<FundRequestModel>, String>(() => RequestNotifier());

class RequestDetailNotifier extends FamilyAsyncNotifier<FundRequestModel, String> {
  @override
  Future<FundRequestModel> build(String requestId) async {
    return ref.read(requestRepoProvider).getRequestById(requestId);
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => ref.read(requestRepoProvider).getRequestById(arg));
  }

  Future<void> approve() async {
    final updated = await ref.read(requestRepoProvider).approveRequest(arg);
    state = AsyncData(updated);
  }

  Future<void> reject(String reason) async {
    final updated = await ref.read(requestRepoProvider).rejectRequest(arg, reason);
    state = AsyncData(updated);
  }

  Future<void> transfer() async {
    final updated = await ref.read(requestRepoProvider).markTransferred(arg);
    state = AsyncData(updated);
  }

  Future<void> confirm({String? receiptPath}) async {
    await ref.read(requestRepoProvider).confirmReceipt(arg, receiptPath: receiptPath);
    await refresh();
  }
}

final requestDetailProvider =
    AsyncNotifierProviderFamily<RequestDetailNotifier, FundRequestModel, String>(() => RequestDetailNotifier());

// My requests across all groups
final myRequestsProvider = FutureProvider<List<FundRequestModel>>((ref) async {
  return ref.read(requestRepoProvider).getMyRequests();
});
