import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_error_handler.dart';
import '../../../core/constants/api_constants.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final Dio _dio = DioClient.instance.dio;

  Future<Map<String, dynamic>> getNotifications({int page = 1}) async {
    try {
      final res = await _dio.get(ApiConstants.notifications, queryParameters: {'page': page, 'limit': 30});
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> markRead(String id) async {
    try {
      await _dio.patch(ApiConstants.markOneRead(id));
    } on DioException catch (_) {}
  }

  Future<void> markAllRead() async {
    try {
      await _dio.patch(ApiConstants.markAllRead);
    } on DioException catch (_) {}
  }

  AppException _handle(DioException e) {
    return AppException.fromDioError(e, fallback: 'Failed');
  }
}
