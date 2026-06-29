import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format_ist.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../../shared/widgets/notification_item.dart';
import 'notification_provider.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  Widget build(BuildContext context) {
    final notifAsync = ref.watch(notificationProvider);
    final unread = ref.watch(unreadCountProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (unread > 0)
            TextButton.icon(
              onPressed: () => ref.read(notificationProvider.notifier).markAllRead(),
              icon: const Icon(LucideIcons.checkCheck, size: 16, color: AppColors.textSecondary),
              label: Text('Mark all read', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
            ),
        ],
      ),
      body: notifAsync.when(
        loading: () => ListView(children: List.generate(5, (_) => const SkeletonNotifItem())),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Text(
                'No notifications',
                style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.primary),
              ),
            );
          }

          // Group by Today / Yesterday / Earlier
          final grouped = <String, List<dynamic>>{};
          for (final n in notifications) {
            final label = dateGroupLabel(n.createdAt);
            grouped.putIfAbsent(label, () => []).add(n);
          }

          return RefreshIndicator(
            onRefresh: () => ref.read(notificationProvider.notifier).refresh(),
            color: AppColors.primary,
            child: ListView(
              children: [
                for (final key in ['Today', 'Yesterday', 'Earlier'])
                  if (grouped.containsKey(key)) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: Text(key, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.8)),
                    ),
                    ...grouped[key]!.map((n) => NotificationItemWidget(
                      notif: n,
                      onTap: () {
                        ref.read(notificationProvider.notifier).markRead(n.id);
                        if (n.relatedRequest != null) context.push('/requests/${n.relatedRequest!.id}');
                        else if (n.relatedGroup != null) context.push('/groups/${n.relatedGroup!.id}');
                      },
                    )),
                  ],
              ],
            ),
          );
        },
      ),
    );
  }
}
