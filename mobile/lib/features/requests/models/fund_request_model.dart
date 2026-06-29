class FundRequestModel {
  final String id;
  final String status;
  final double amount;
  final String purpose;
  final String? description;
  final String? requiredDate;
  final String? attachmentUrl;
  final String? receiptUrl;
  final String? rejectedReason;
  final String createdAt;
  final String? approvedAt;
  final String? transferredAt;
  final String? completedAt;
  final RequestUser requestedBy;
  final RequestUser? approvedBy;
  final RequestUser? transferredBy;
  final RequestGroup? group;

  const FundRequestModel({
    required this.id,
    required this.status,
    required this.amount,
    required this.purpose,
    this.description,
    this.requiredDate,
    this.attachmentUrl,
    this.receiptUrl,
    this.rejectedReason,
    required this.createdAt,
    this.approvedAt,
    this.transferredAt,
    this.completedAt,
    required this.requestedBy,
    this.approvedBy,
    this.transferredBy,
    this.group,
  });

  factory FundRequestModel.fromJson(Map<String, dynamic> json) => FundRequestModel(
        id: json['_id'] as String,
        status: json['status'] as String,
        amount: (json['amount'] as num).toDouble(),
        purpose: json['purpose'] as String,
        description: json['description'] as String?,
        requiredDate: json['requiredDate'] as String?,
        attachmentUrl: json['attachmentUrl'] as String?,
        receiptUrl: json['receiptUrl'] as String?,
        rejectedReason: json['rejectedReason'] as String?,
        createdAt: json['createdAt'] as String,
        approvedAt: json['approvedAt'] as String?,
        transferredAt: json['transferredAt'] as String?,
        completedAt: json['completedAt'] as String?,
        requestedBy: json['requestedBy'] is Map ? RequestUser.fromJson(json['requestedBy'] as Map<String, dynamic>) : RequestUser(id: json['requestedBy'] as String? ?? '', name: 'Unknown'),
        approvedBy: json['approvedBy'] is Map ? RequestUser.fromJson(json['approvedBy'] as Map<String, dynamic>) : null,
        transferredBy: json['transferredBy'] is Map ? RequestUser.fromJson(json['transferredBy'] as Map<String, dynamic>) : null,
        group: json['group'] is Map ? RequestGroup.fromJson(json['group'] as Map<String, dynamic>) : null,
      );
}

class RequestUser {
  final String id;
  final String name;
  final String? username;

  const RequestUser({required this.id, required this.name, this.username});

  factory RequestUser.fromJson(Map<String, dynamic> json) => RequestUser(
        id: json['_id'] as String,
        name: json['name'] as String,
        username: json['username'] as String?,
      );
}

class RequestGroup {
  final String id;
  final String name;
  final String? groupCode;

  const RequestGroup({required this.id, required this.name, this.groupCode});

  factory RequestGroup.fromJson(Map<String, dynamic> json) => RequestGroup(
        id: json['_id'] as String,
        name: json['name'] as String,
        groupCode: json['groupCode'] as String?,
      );
}
