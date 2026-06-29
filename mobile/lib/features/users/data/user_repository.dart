import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_error_handler.dart';
import '../../auth/models/user_model.dart';

class UserRepository {
  final Dio _dio = DioClient.instance.dio;

  Future<List<UserModel>> searchUsers(String query) async {
    if (query.trim().length < 2) return [];
    
    try {
      final res = await _dio.get('/users/search', queryParameters: {'q': query.trim()});
      final List<dynamic> data = res.data['data'] as List<dynamic>;
      return data.map((json) => UserModel.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw AppException.fromDioError(e, fallback: 'Failed to search users');
    }
  }
}
