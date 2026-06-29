import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
        primary: AppColors.primary,
        onPrimary: AppColors.textPrimary,
      ),
      scaffoldBackgroundColor: AppColors.surface,
      textTheme: _buildTextTheme(),
      inputDecorationTheme: _buildInputTheme(),
      elevatedButtonTheme: _buildElevatedButtonTheme(),
      outlinedButtonTheme: _buildOutlinedButtonTheme(),
      appBarTheme: _buildAppBarTheme(),
      bottomNavigationBarTheme: _buildBottomNavTheme(),
      cardTheme: _buildCardTheme(),
      dividerTheme: const DividerThemeData(color: AppColors.accent, thickness: 1),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
        },
      ),
    );
  }

  static TextTheme _buildTextTheme() {
    return GoogleFonts.interTextTheme().copyWith(
      displayLarge: GoogleFonts.inter(fontSize: 30, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      headlineMedium: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      headlineSmall: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      titleLarge: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      titleMedium: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
      bodyLarge: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
      bodyMedium: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
      bodySmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textMuted),
      labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      labelSmall: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w500, color: AppColors.textMuted, letterSpacing: 0.8),
    );
  }

  static InputDecorationTheme _buildInputTheme() {
    const border = OutlineInputBorder(
      borderRadius: BorderRadius.all(Radius.circular(12)),
      borderSide: BorderSide(color: AppColors.accent, width: 1.5),
    );
    return InputDecorationTheme(
      filled: true,
      fillColor: AppColors.card,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: border,
      enabledBorder: border,
      focusedBorder: border.copyWith(borderSide: const BorderSide(color: AppColors.primary, width: 2)),
      errorBorder: border.copyWith(borderSide: const BorderSide(color: AppColors.danger, width: 1.5)),
      focusedErrorBorder: border.copyWith(borderSide: const BorderSide(color: AppColors.danger, width: 2)),
      hintStyle: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted),
      labelStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
      errorStyle: GoogleFonts.inter(fontSize: 11, color: AppColors.danger),
    );
  }

  static ElevatedButtonThemeData _buildElevatedButtonTheme() {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textPrimary,
        minimumSize: const Size.fromHeight(50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 0,
        textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    );
  }

  static OutlinedButtonThemeData _buildOutlinedButtonTheme() {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.textSecondary,
        side: const BorderSide(color: AppColors.accent, width: 1.5),
        minimumSize: const Size.fromHeight(50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    );
  }

  static AppBarTheme _buildAppBarTheme() {
    return AppBarTheme(
      backgroundColor: AppColors.card,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      scrolledUnderElevation: 1,
      shadowColor: AppColors.accent,
      surfaceTintColor: Colors.transparent,
      centerTitle: false,
      titleTextStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
    );
  }

  static BottomNavigationBarThemeData _buildBottomNavTheme() {
    return BottomNavigationBarThemeData(
      backgroundColor: AppColors.card,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textMuted,
      elevation: 8,
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600),
      unselectedLabelStyle: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w500),
    );
  }

  static CardThemeData _buildCardTheme() {
    return CardThemeData(
      color: AppColors.card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border, width: 1),
      ),
      margin: EdgeInsets.zero,
    );
  }

  // Amount text style — tabular figures for alignment
  static TextStyle amountStyle({double fontSize = 18, Color color = AppColors.textPrimary}) {
    return GoogleFonts.inter(
      fontSize: fontSize,
      fontWeight: FontWeight.w700,
      color: color,
      fontFeatures: const [FontFeature.tabularFigures()],
    );
  }

  static TextStyle metaStyle({double fontSize = 12, Color color = AppColors.textMuted}) {
    return GoogleFonts.inter(fontSize: fontSize, fontWeight: FontWeight.w400, color: color);
  }
}
