import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  const SecureStorage._();
  static const SecureStorage instance = SecureStorage._();

  static final _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';
  static const _userKey = 'user_json';

  Future<void> saveTokens({required String access, String? refresh}) async {
    await _storage.write(key: _accessKey, value: access);
    if (refresh != null) await _storage.write(key: _refreshKey, value: refresh);
  }

  Future<String?> getAccessToken() => _storage.read(key: _accessKey);
  Future<String?> getRefreshToken() => _storage.read(key: _refreshKey);

  Future<void> saveUser(String userJson) => _storage.write(key: _userKey, value: userJson);
  Future<String?> getUser() => _storage.read(key: _userKey);

  Future<void> clearAll() async {
    try { await _storage.delete(key: _accessKey); } catch (_) {}
    try { await _storage.delete(key: _refreshKey); } catch (_) {}
    try { await _storage.delete(key: _userKey); } catch (_) {}
    try { await _storage.deleteAll(); } catch (_) {}
  }
}
