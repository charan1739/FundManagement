import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_error_handler.dart';
import '../../../core/constants/api_constants.dart';
import '../../groups/models/transaction_model.dart';
import '../../groups/models/activity_model.dart';

class FundRepository {
  final Dio _dio = DioClient.instance.dio;

  Future<Map<String, dynamic>> addFunds({
    required String groupId,
    required double amount,
    String? source,
    String? remarks,
    String? transactionDate,
    String? proofPath,
  }) async {
    try {
      final formData = FormData.fromMap({
        'amount': amount.toString(),
        if (source != null) 'source': source,
        if (remarks != null) 'remarks': remarks,
        if (transactionDate != null) 'transactionDate': transactionDate,
        if (proofPath != null)
          'proof': await MultipartFile.fromFile(proofPath, filename: proofPath.split('/').last),
      });
      final res = await _dio.post(ApiConstants.addFund(groupId), data: formData);
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<List<TransactionModel>> getTransactions(String groupId, {int page = 1}) async {
    try {
      final res = await _dio.get(ApiConstants.transactions(groupId), queryParameters: {'page': page, 'limit': 20});
      final list = res.data['data'] as List;
      return list.map((e) => TransactionModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<List<ActivityModel>> getActivity(String groupId, {int page = 1}) async {
    try {
      final res = await _dio.get(ApiConstants.activity(groupId), queryParameters: {'page': page, 'limit': 20});
      final list = res.data['data'] as List;
      return list.map((e) => ActivityModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  AppException _handle(DioException e) {
    return AppException.fromDioError(e);
  }
}
