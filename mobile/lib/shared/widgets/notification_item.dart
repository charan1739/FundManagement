import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/format_ist.dart';
import '../../features/notifications/models/notification_model.dart';

const _iconMap = <String, IconData>{
  'request_raised': LucideIcons.fileText,
  'request_approved': LucideIcons.checkCircle,
  'request_rejected': LucideIcons.xCircle,
  'funds_transferred': LucideIcons.arrowUpRight,
  'confirm_pending': LucideIcons.clock,
  'member_joined': LucideIcons.userPlus,
  'member_removed': LucideIcons.userMinus,
  'join_request': LucideIcons.users,
  'join_accepted': LucideIcons.checkCircle,
  'join_declined': LucideIcons.xCircle,
  'funds_added': LucideIcons.arrowUpRight,
};

const _iconBgMap = <String, Color>{
  'request_raised': Color(0x26F59E0B),
  'request_approved': Color(0x2622C55E),
  'request_rejected': Color(0x26EF4444),
  'funds_transferred': Color(0x26B1B2FF),
  'confirm_pending': Color(0x26F59E0B),
  'member_joined': Color(0x26B1B2FF),
  'member_removed': Color(0x26EF4444),
  'join_request': Color(0x26B1B2FF),
  'join_accepted': Color(0x2622C55E),
  'join_declined': Color(0x26EF4444),
  'funds_added': Color(0x2622C55E),
};

const _iconColorMap = <String, Color>{
  'request_raised': AppColors.warning,
  'request_approved': AppColors.success,
  'request_rejected': AppColors.danger,
  'funds_transferred': AppColors.primaryHover,
  'confirm_pending': AppColors.warning,
  'member_joined': AppColors.primaryHover,
  'member_removed': AppColors.danger,
  'join_request': AppColors.primaryHover,
  'join_accepted': AppColors.success,
  'join_declined': AppColors.danger,
  'funds_added': AppColors.success,
};

class NotificationItemWidget extends StatelessWidget {
  final NotificationModel notif;
  final VoidCallback onTap;

  const NotificationItemWidget({super.key, required this.notif, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final icon = _iconMap[notif.type] ?? LucideIcons.bell;
    final bg = _iconBgMap[notif.type] ?? const Color(0x26B1B2FF);
    final fg = _iconColorMap[notif.type] ?? AppColors.primaryHover;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: notif.read ? AppColors.card : AppColors.surface,
          border: Border(
            left: notif.read ? BorderSide.none : const BorderSide(color: AppColors.primary, width: 3),
            bottom: const BorderSide(color: AppColors.accent, width: 0.5),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, size: 20, color: fg),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(notif.title, style: GoogleFonts.inter(fontSize: 13, fontWeight: notif.read ? FontWeight.w500 : FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 3),
                  Text(notif.message, style: GoogleFonts.inter(fontSize: 12, color: notif.read ? AppColors.textMuted : AppColors.textSecondary), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 5),
                  Text(formatRelative(notif.createdAt), style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
