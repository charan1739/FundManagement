class TransactionModel {
  final String id;
  final String type; // 'fund-added' | 'transfer-completed'
  final double amount;
  final String? remarks;
  final String? proofUrl;
  final String createdAt;
  final TransactionUser addedBy;

  const TransactionModel({
    required this.id,
    required this.type,
    required this.amount,
    this.remarks,
    this.proofUrl,
    required this.createdAt,
    required this.addedBy,
  });

  bool get isCredit => type == 'fund-added';

  factory TransactionModel.fromJson(Map<String, dynamic> json) => TransactionModel(
        id: json['_id'] as String,
        type: json['type'] as String,
        amount: (json['amount'] as num).toDouble(),
        remarks: json['remarks'] as String?,
        proofUrl: json['proofUrl'] as String?,
        createdAt: json['createdAt'] as String,
        addedBy: TransactionUser.fromJson(json['addedBy'] as Map<String, dynamic>),
      );
}

class TransactionUser {
  final String id;
  final String name;
  final String username;

  const TransactionUser({required this.id, required this.name, required this.username});

  factory TransactionUser.fromJson(Map<String, dynamic> json) => TransactionUser(
        id: json['_id'] as String,
        name: json['name'] as String,
        username: json['username'] as String,
      );
}
