class UserModel {
  final String id;
  final String name;
  final String email;
  final String username;
  final String? phone;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.username,
    this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['_id'] as String,
        name: json['name'] as String,
        email: json['email'] as String,
        username: json['username'] as String,
        phone: json['phone'] as String?,
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name,
        'email': email,
        'username': username,
        'phone': phone,
      };

  UserModel copyWith({String? name, String? phone}) => UserModel(
        id: id,
        name: name ?? this.name,
        email: email,
        username: username,
        phone: phone ?? this.phone,
      );
}
