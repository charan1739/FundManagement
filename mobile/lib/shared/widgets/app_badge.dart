import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

enum BadgeVariant { primary, success, warning, danger, accent, muted }

const _statusVariantMap = {
  'pending': BadgeVariant.warning,
  'approved': BadgeVariant.success,
  'rejected': BadgeVariant.danger,
  'transferred': BadgeVariant.primary,
  'received': BadgeVariant.accent,
  'completed': BadgeVariant.success,
  'admin': BadgeVariant.primary,
  'member': BadgeVariant.accent,
  'active': BadgeVariant.success,
  'inactive': BadgeVariant.muted,
};

class AppBadge extends StatelessWidget {
  final String label;
  final BadgeVariant? variant;
  final String? status; // auto-pick variant from status string

  const AppBadge({super.key, required this.label, this.variant, this.status});

  factory AppBadge.status(String status) => AppBadge(
        label: _capitalize(status),
        status: status,
      );

  static String _capitalize(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';

  @override
  Widget build(BuildContext context) {
    final v = variant ?? _statusVariantMap[status ?? label.toLowerCase()] ?? BadgeVariant.accent;

    final (bg, fg) = switch (v) {
      BadgeVariant.primary => (AppColors.primary.withOpacity(0.25), AppColors.primaryHover),
      BadgeVariant.success => (AppColors.success.withOpacity(0.15), AppColors.success),
      BadgeVariant.warning => (AppColors.warning.withOpacity(0.15), AppColors.warning),
      BadgeVariant.danger => (AppColors.danger.withOpacity(0.15), AppColors.danger),
      BadgeVariant.accent => (AppColors.accent, AppColors.textSecondary),
      BadgeVariant.muted => (AppColors.surface, AppColors.textMuted),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: fg)),
    );
  }
}
