class ApiConstants {
  ApiConstants._();

  // Inject at build/run time via: flutter run --dart-define=BASE_URL=http://10.0.2.2:5000
  // Falls back to the deployed Render backend if not provided.
  static const String _base = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'http://10.0.2.2:5000',
  );

  static const String baseUrl = '$_base/api';
  static const String socketUrl = _base;

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh-token';

  // Groups
  static const String groups = '/groups';
  static const String pendingInvites = '/groups/pending-invites';
  static const String joinByCode = '/groups/join';

  static String groupDetail(String id) => '/groups/$id';
  static String members(String id) => '/groups/$id/members';
  static String removeMember(String id, String userId) => '/groups/$id/members/$userId';
  static String joinGroup(String id) => '/groups/$id/join';
  static String declineGroup(String id) => '/groups/$id/decline';
  static String addFund(String id) => '/groups/$id/funds';
  static String transactions(String id) => '/groups/$id/transactions';
  static String activity(String id) => '/groups/$id/activity';
  static String groupRequests(String id) => '/groups/$id/requests';

  // Requests
  static const String myRequests = '/requests/user';
  static String requestDetail(String id) => '/requests/$id';
  static String approveRequest(String id) => '/requests/$id/approve';
  static String rejectRequest(String id) => '/requests/$id/reject';
  static String transferRequest(String id) => '/requests/$id/transfer';
  static String confirmRequest(String id) => '/requests/$id/confirm';

  // Notifications
  static const String notifications = '/notifications';
  static const String markAllRead = '/notifications/read';
  static String markOneRead(String id) => '/notifications/$id/read';

  // Profile
  static const String profile = '/profile';
  static const String changePassword = '/profile/password';
}
