import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

enum AppButtonVariant { primary, secondary, danger, ghost, success }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool fullWidth;
  final AppButtonVariant variant;
  final Widget? icon;
  final double? height;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.fullWidth = false,
    this.variant = AppButtonVariant.primary,
    this.icon,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final (bg, fg, border) = switch (variant) {
      AppButtonVariant.primary => (AppColors.primary, AppColors.textPrimary, AppColors.primary),
      AppButtonVariant.secondary => (AppColors.accent, AppColors.textSecondary, AppColors.accent),
      AppButtonVariant.danger => (AppColors.danger, Colors.white, AppColors.danger),
      AppButtonVariant.success => (AppColors.success, Colors.white, AppColors.success),
      AppButtonVariant.ghost => (Colors.transparent, AppColors.textSecondary, AppColors.accent),
    };

    Widget child = loading
        ? SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2.5, color: fg),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[icon!, const SizedBox(width: 6)],
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(label, style: AppTheme.lightTheme.textTheme.labelLarge?.copyWith(color: fg)),
                ),
              ),
            ],
          );

    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: height ?? 48,
      child: ElevatedButton(
        onPressed: loading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          side: border != bg ? BorderSide(color: border, width: 1.5) : BorderSide.none,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
        child: child,
      ),
    );
  }
}
