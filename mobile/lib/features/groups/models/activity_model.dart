class ActivityModel {
  final String id;
  final String action;
  final String createdAt;
  final ActivityUser user;

  const ActivityModel({
    required this.id,
    required this.action,
    required this.createdAt,
    required this.user,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) => ActivityModel(
        id: json['_id'] as String,
        action: json['action'] as String,
        createdAt: json['createdAt'] as String,
        user: ActivityUser.fromJson(json['user'] as Map<String, dynamic>),
      );
}

class ActivityUser {
  final String id;
  final String name;

  const ActivityUser({required this.id, required this.name});

  factory ActivityUser.fromJson(Map<String, dynamic> json) =>
      ActivityUser(id: json['_id'] as String, name: json['name'] as String);
}
