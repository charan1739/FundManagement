class GroupModel {
  final String id;
  final String name;
  final String? description;
  final String groupCode;
  final double currentBalance;
  final double availableBalance;
  final double allocatedBalance;
  final String? myRole; // 'admin' | 'member'
  final String status;

  const GroupModel({
    required this.id,
    required this.name,
    this.description,
    required this.groupCode,
    required this.currentBalance,
    this.availableBalance = 0,
    this.allocatedBalance = 0,
    this.myRole,
    required this.status,
  });

  bool get isAdmin => myRole?.toLowerCase() == 'admin';

  factory GroupModel.fromJson(Map<String, dynamic> json) {
    print('GroupModel.fromJson: ${json['name']} myRole: ${json['myRole']}');
    return GroupModel(
        id: json['_id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        groupCode: json['groupCode'] as String? ?? '',
        currentBalance: (json['currentBalance'] as num?)?.toDouble() ?? 0,
        availableBalance: (json['availableBalance'] as num?)?.toDouble() ?? 0,
        allocatedBalance: (json['allocatedBalance'] as num?)?.toDouble() ?? 0,
        myRole: json['myRole'] as String?,
        status: json['status'] as String? ?? 'active',
      );
  }
}
