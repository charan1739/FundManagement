class NotificationModel {
  final String id;
  final String type;
  final String title;
  final String message;
  final bool read;
  final String createdAt;
  final NotifGroup? relatedGroup;
  final NotifRequest? relatedRequest;

  const NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.read,
    required this.createdAt,
    this.relatedGroup,
    this.relatedRequest,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
        id: json['_id'] as String,
        type: json['type'] as String,
        title: json['title'] as String,
        message: json['message'] as String,
        read: json['read'] as bool? ?? false,
        createdAt: json['createdAt'] as String,
        relatedGroup: json['relatedGroup'] != null ? NotifGroup.fromJson(json['relatedGroup'] as Map<String, dynamic>) : null,
        relatedRequest: json['relatedRequest'] != null ? NotifRequest.fromJson(json['relatedRequest'] as Map<String, dynamic>) : null,
      );

  NotificationModel copyWith({bool? read}) => NotificationModel(
        id: id, type: type, title: title, message: message,
        read: read ?? this.read, createdAt: createdAt,
        relatedGroup: relatedGroup, relatedRequest: relatedRequest,
      );
}

class NotifGroup {
  final String id;
  final String name;

  const NotifGroup({required this.id, required this.name});

  factory NotifGroup.fromJson(Map<String, dynamic> json) =>
      NotifGroup(id: json['_id'] as String, name: json['name'] as String);
}

class NotifRequest {
  final String id;
  final double? amount;
  final String? purpose;

  const NotifRequest({required this.id, this.amount, this.purpose});

  factory NotifRequest.fromJson(Map<String, dynamic> json) => NotifRequest(
        id: json['_id'] as String,
        amount: (json['amount'] as num?)?.toDouble(),
        purpose: json['purpose'] as String?,
      );
}
