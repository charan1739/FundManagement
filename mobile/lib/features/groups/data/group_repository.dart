import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_error_handler.dart';
import '../../../core/constants/api_constants.dart';
import '../../groups/models/group_model.dart';
import '../../groups/models/member_model.dart';

class GroupRepository {
  final Dio _dio = DioClient.instance.dio;

  Future<List<GroupModel>> getMyGroups() async {
    try {
      final res = await _dio.get(ApiConstants.groups);
      final list = res.data['data'] as List;
      return list.map((e) => GroupModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<List<InviteModel>> getPendingInvites() async {
    try {
      final res = await _dio.get(ApiConstants.pendingInvites);
      final list = res.data['data'] as List;
      return list.map((e) => InviteModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<GroupModel> createGroup(String name, {String? description}) async {
    try {
      final res = await _dio.post(ApiConstants.groups, data: {'name': name, 'description': description});
      return GroupModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<GroupModel> getGroup(String id) async {
    try {
      final res = await _dio.get(ApiConstants.groupDetail(id));
      print('GET GROUP API RAW RESPONSE: ${res.data['data']}');
      return GroupModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<List<MemberModel>> getMembers(String id) async {
    try {
      final res = await _dio.get(ApiConstants.members(id));
      final list = res.data['data'] as List;
      return list.map((e) => MemberModel.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> inviteMember(String groupId, String emailOrUsername) async {
    try {
      await _dio.post(ApiConstants.members(groupId), data: {'emailOrUsername': emailOrUsername});
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> joinByCode(String code) async {
    try {
      await _dio.post(ApiConstants.joinByCode, data: {'code': code});
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> acceptInvite(String groupId) async {
    try {
      await _dio.post(ApiConstants.joinGroup(groupId));
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> declineInvite(String groupId) async {
    try {
      await _dio.post(ApiConstants.declineGroup(groupId));
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  Future<void> removeMember(String groupId, String userId) async {
    try {
      await _dio.delete(ApiConstants.removeMember(groupId, userId));
    } on DioException catch (e) {
      throw _handle(e);
    }
  }

  AppException _handle(DioException e) {
    return AppException.fromDioError(e);
  }
}
