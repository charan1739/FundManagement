import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_error_handler.dart';
import '../../../core/constants/api_constants.dart';
import '../models/fund_request_model.dart';

class RequestRepository {
  final Dio _dio = DioClient.instance.dio;

  Future<FundRequestModel> createRequest({
    required String groupId,
    required double amount,
    required String purpose,
    String? description,
    String? requiredDate,
    String? attachmentPath,
  }) async {
    try {
      final formData = FormData.fromMap({
        'amount': amount.toString(),
        'purpose': purpose,
        if (description != null) 'description': description,
        if (requiredDate != null) 'requiredDate': requiredDate,
        if (attachmentPath != null)
          'attachment': await MultipartFile.fromFile(attachmentPath, filename: attachmentPath.split('/').last),
      });
      final res = await _dio.post(ApiConstants.groupRequests(groupId), data: formData);
      return FundRequestModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<List<FundRequestModel>> getGroupRequests(String groupId, {String? status}) async {
    try {
      final res = await _dio.get(
        ApiConstants.groupRequests(groupId),
        queryParameters: status != null ? {'status': status} : null,
      );
      final list = res.data['data'] as List;
      return list.map((e) => FundRequestModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<FundRequestModel> getRequestById(String id) async {
    try {
      final res = await _dio.get(ApiConstants.requestDetail(id));
      return FundRequestModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<List<FundRequestModel>> getMyRequests() async {
    try {
      final res = await _dio.get(ApiConstants.myRequests);
      final list = res.data['data'] as List;
      return list.map((e) => FundRequestModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<FundRequestModel> approveRequest(String id) async {
    try {
      final res = await _dio.patch(ApiConstants.approveRequest(id));
      return FundRequestModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<FundRequestModel> rejectRequest(String id, String reason) async {
    try {
      final res = await _dio.patch(ApiConstants.rejectRequest(id), data: {'reason': reason});
      return FundRequestModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<FundRequestModel> markTransferred(String id) async {
    try {
      final res = await _dio.patch(ApiConstants.transferRequest(id));
      return FundRequestModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<Map<String, dynamic>> confirmReceipt(String id, {String? receiptPath}) async {
    try {
      final formData = FormData.fromMap({
        if (receiptPath != null)
          'receipt': await MultipartFile.fromFile(receiptPath, filename: receiptPath.split('/').last),
      });
      final res = await _dio.patch(ApiConstants.confirmRequest(id), data: formData);
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  AppException _handle(DioException e) {
    return AppException.fromDioError(e);
  }
}
