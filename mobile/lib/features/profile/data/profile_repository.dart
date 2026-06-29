import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_error_handler.dart';
import '../../../core/constants/api_constants.dart';
import '../../auth/models/user_model.dart';

class ProfileRepository {
  final Dio _dio = DioClient.instance.dio;

  Future<UserModel> getProfile() async {
    try {
      final res = await _dio.get(ApiConstants.profile);
      return UserModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<UserModel> updateProfile({String? name, String? phone}) async {
    try {
      final res = await _dio.patch(ApiConstants.profile, data: {
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
      });
      return UserModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> changePassword(String current, String newPwd) async {
    try {
      await _dio.patch(ApiConstants.changePassword, data: {
        'currentPassword': current,
        'newPassword': newPwd,
      });
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> deleteAccount() async {
    try {
      await _dio.delete(ApiConstants.profile, data: {'confirmation': 'DELETE'});
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  AppException _handle(DioException e) {
    return AppException.fromDioError(e);
  }
}
