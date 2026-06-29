import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

Color avatarColor(String name) {
  final hash = name.codeUnits.fold(0, (acc, c) => acc + c);
  return AppColors.avatarPalette[hash % AppColors.avatarPalette.length];
}

String getInitials(String name) {
  final parts = name.trim().split(RegExp(r'\s+'));
  if (parts.isEmpty) return '?';
  if (parts.length == 1) return parts[0][0].toUpperCase();
  return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
}
