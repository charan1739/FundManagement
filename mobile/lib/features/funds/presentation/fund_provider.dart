import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/fund_repository.dart';
import '../../../features/groups/models/transaction_model.dart';
import '../../../features/groups/models/activity_model.dart';

final fundRepoProvider = Provider<FundRepository>((ref) => FundRepository());

class TransactionNotifier extends FamilyAsyncNotifier<List<TransactionModel>, String> {
  @override
  Future<List<TransactionModel>> build(String groupId) async {
    return ref.read(fundRepoProvider).getTransactions(groupId);
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => ref.read(fundRepoProvider).getTransactions(arg));
  }
}

final transactionProvider =
    AsyncNotifierProviderFamily<TransactionNotifier, List<TransactionModel>, String>(() => TransactionNotifier());

class ActivityNotifier extends FamilyAsyncNotifier<List<ActivityModel>, String> {
  @override
  Future<List<ActivityModel>> build(String groupId) async {
    return ref.read(fundRepoProvider).getActivity(groupId);
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => ref.read(fundRepoProvider).getActivity(arg));
  }
}

final activityProvider =
    AsyncNotifierProviderFamily<ActivityNotifier, List<ActivityModel>, String>(() => ActivityNotifier());
