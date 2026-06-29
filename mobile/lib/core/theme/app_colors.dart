import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary Palette
  static const Color primary = Color(0xFFB1B2FF);
  static const Color primaryHover = Color(0xFF9899E8);
  static const Color secondary = Color(0xFFAAC4FF);
  static const Color accent = Color(0xFFD2DAFF);
  static const Color surface = Color(0xFFEEF1FF);
  static const Color card = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFD2DAFF);

  // Text
  static const Color textPrimary = Color(0xFF1E1B4B);
  static const Color textSecondary = Color(0xFF6366A3);
  static const Color textMuted = Color(0xFFA5A7C7);

  // Status
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);

  // Balance Banner
  static const Color bannerBg = Color(0xFFB1B2FF);
  static const Color bannerText = Color(0xFF1E1B4B);

  // Avatar palette (deterministic from name hash)
  static const List<Color> avatarPalette = [
    Color(0xFFB1B2FF),
    Color(0xFFAAC4FF),
    Color(0xFFD2DAFF),
    Color(0xFFA5B4FC),
    Color(0xFFC4B5FD),
    Color(0xFF93C5FD),
  ];
}
