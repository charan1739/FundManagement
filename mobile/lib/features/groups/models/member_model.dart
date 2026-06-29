class MemberModel {
  final String id;
  final MemberUser user;
  final String role;
  final String status;
  final String? joinedAt;

  const MemberModel({
    required this.id,
    required this.user,
    required this.role,
    required this.status,
    this.joinedAt,
  });

  bool get isAdmin => role == 'admin';
  bool get isPending => status == 'pending';

  factory MemberModel.fromJson(Map<String, dynamic> json) => MemberModel(
        id: json['_id'] as String,
        user: MemberUser.fromJson(json['user'] as Map<String, dynamic>),
        role: json['role'] as String,
        status: json['status'] as String,
        joinedAt: json['joinedAt'] as String?,
      );
}

class MemberUser {
  final String id;
  final String name;
  final String username;
  final String? email;

  const MemberUser({required this.id, required this.name, required this.username, this.email});

  factory MemberUser.fromJson(Map<String, dynamic> json) => MemberUser(
        id: json['_id'] as String,
        name: json['name'] as String,
        username: json['username'] as String,
        email: json['email'] as String?,
      );
}

class InviteModel {
  final String id;
  final InviteGroup group;

  const InviteModel({required this.id, required this.group});

  factory InviteModel.fromJson(Map<String, dynamic> json) => InviteModel(
        id: json['_id'] as String,
        group: InviteGroup.fromJson(json['group'] as Map<String, dynamic>),
      );
}

class InviteGroup {
  final String id;
  final String name;
  final String createdByName;

  const InviteGroup({required this.id, required this.name, required this.createdByName});

  factory InviteGroup.fromJson(Map<String, dynamic> json) {
    final creator = json['createdBy'] as Map<String, dynamic>?;
    return InviteGroup(
      id: json['_id'] as String,
      name: json['name'] as String,
      createdByName: creator?['name'] as String? ?? '',
    );
  }
}
