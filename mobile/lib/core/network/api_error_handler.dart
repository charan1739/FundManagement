import 'package:dio/dio.dart';

class AppException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;

  const AppException({required this.message, this.statusCode, this.code});

  factory AppException.network() =>
      const AppException(message: 'No internet connection', code: 'NETWORK_ERROR');

  factory AppException.server() =>
      const AppException(message: 'Something went wrong. Please try again.', code: 'SERVER_ERROR');

  factory AppException.fromStatusCode(int code, String message) =>
      AppException(message: message, statusCode: code);

  factory AppException.fromDioError(DioException e, {String fallback = 'Request failed'}) {
    if (e.type == DioExceptionType.connectionError) return AppException.network();
    String msg = fallback;
    if (e.response?.data is Map<String, dynamic>) {
      msg = (e.response!.data as Map<String, dynamic>)['message'] as String? ?? fallback;
    } else if (e.response?.data is String) {
      msg = e.response!.data as String;
    }
    return AppException(message: msg, statusCode: e.response?.statusCode);
  }

  @override
  String toString() => message;
}
