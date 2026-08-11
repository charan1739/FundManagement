import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_error_handler.dart';
import '../../../core/constants/api_constants.dart';
import '../models/user_model.dart';
import '../../../core/constants/app_strings.dart';

class AuthRepository {
  final Dio _dio = DioClient.instance.dio;

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final res = await _dio.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );
      return res.data['data'] as Map<String, dynamic>;
    } on DioException catch (e) {
      throw AppException.fromDioError(e, fallback: AppStrings.serverError);
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String username,
    required String password,
  }) async {
    try {
      final res = await _dio.post(ApiConstants.register,
          data: {'name': name, 'email': email, 'username': username, 'password': password});
      return res.data['data'] as Map<String, dynamic>;
    } on DioException catch (e) {
      throw AppException.fromDioError(e, fallback: 'Registration failed');
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConstants.logout);
    } catch (_) {}
  }
}

