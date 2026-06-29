import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/utils/avatar_color.dart';
import '../../../core/utils/format_inr.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/bottom_sheet_wrapper.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../groups/presentation/group_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _invitesExpanded = false;

  Future<void> _handleCreate() async {
    final nameCtrl = TextEditingController();
    final created = await AppBottomSheet.show<bool>(
      context,
      title: AppStrings.createGroup,
      content: Column(children: [
        AppInput(label: AppStrings.groupNameLabel, hintText: 'e.g. Office Supplies Fund', controller: nameCtrl, maxLength: 100),
      ]),
      stickyBottom: AppButton(
        label: AppStrings.createGroup,
        fullWidth: true,
        onPressed: () async {
          if (nameCtrl.text.trim().isEmpty) return;
          try {
            await ref.read(homeProvider.notifier).createGroup(nameCtrl.text.trim());
            if (context.mounted) Navigator.of(context).pop(true);
          } catch (e) {
            if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final homeAsync = ref.watch(homeProvider);
    final user = ref.watch(authProvider).valueOrNull;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Welcome back,', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
          Text(user?.name ?? '', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ]),
        actions: [
          IconButton(
            onPressed: _handleCreate,
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
              child: const Icon(LucideIcons.plusCircle, size: 18, color: AppColors.textPrimary),
            ),
          ),
          IconButton(
            onPressed: () async {
              final confirmed = await showConfirmDialog(
                context,
                title: AppStrings.signOut,
                message: 'Are you sure you want to log out?',
                confirmLabel: AppStrings.signOut,
                confirmVariant: AppButtonVariant.ghost,
              );
              if (confirmed == true) {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) context.go('/login');
              }
            },
            icon: const Icon(LucideIcons.logOut, size: 20, color: AppColors.textMuted),
          ),
        ],
      ),
      body: homeAsync.when(
        loading: () => ListView(children: List.generate(3, (_) => const SkeletonGroupCard())),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (home) {
          final groups = home.groups;
          final invites = home.invites;
          return RefreshIndicator(
            onRefresh: () => ref.read(homeProvider.notifier).refresh(),
            color: AppColors.primary,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Pending invites
                if (invites.isNotEmpty) ...[
                  GestureDetector(
                    onTap: () => setState(() => _invitesExpanded = !_invitesExpanded),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.primary.withOpacity(0.4)),
                      ),
                      child: Column(
                        children: [
                          Row(children: [
                            const Icon(LucideIcons.userPlus, size: 18, color: AppColors.primaryHover),
                            const SizedBox(width: 10),
                            Expanded(child: Text('You have ${invites.length} pending invite${invites.length > 1 ? 's' : ''}',
                                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary))),
                            Icon(_invitesExpanded ? LucideIcons.chevronUp : LucideIcons.chevronDown, size: 18, color: AppColors.textMuted),
                          ]),
                          if (_invitesExpanded)
                            for (final invite in invites)
                              Container(
                                margin: const EdgeInsets.only(top: 12),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12)),
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(invite.group.name, style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                  Text('Invited by ${invite.group.createdByName}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
                                  const SizedBox(height: 10),
                                  Row(children: [
                                    Expanded(child: AppButton(label: AppStrings.decline, variant: AppButtonVariant.secondary, height: 36, fullWidth: true,
                                      onPressed: () => ref.read(homeProvider.notifier).declineInvite(invite.group.id))),
                                    const SizedBox(width: 10),
                                    Expanded(child: AppButton(label: AppStrings.accept, height: 36, fullWidth: true,
                                      onPressed: () => ref.read(homeProvider.notifier).acceptInvite(invite.group.id))),
                                  ]),
                                ]),
                              ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
                // Section label
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Text(AppStrings.myGroups, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted, letterSpacing: 0.8)),
                ),
                // Groups
                if (groups.isEmpty)
                  AppCard(child: EmptyState(
                    icon: LucideIcons.users,
                    title: AppStrings.noGroups,
                    subtitle: AppStrings.noGroupsSubtitle,
                    ctaLabel: AppStrings.createGroup,
                    onCta: _handleCreate,
                  ))
                else
                  AppCard(child: Column(
                    children: groups.asMap().entries.map((entry) {
                      final i = entry.key;
                      final g = entry.value;
                      return Column(
                        children: [
                          ListTile(
                            leading: AppAvatar(name: g.name, size: 48),
                            title: Row(children: [
                              Expanded(child: Text(g.name, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary))),
                              const SizedBox(width: 8),
                              AppBadge.status(g.myRole ?? 'member'),
                            ]),
                            subtitle: Text('Balance: ${formatINR(g.currentBalance)}', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
                            trailing: const Icon(LucideIcons.chevronRight, size: 18, color: AppColors.textMuted),
                            onTap: () => context.push('/groups/${g.id}'),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          ),
                          if (i < groups.length - 1) const Divider(height: 1, indent: 16, endIndent: 16),
                        ],
                      );
                    }).toList(),
                  )),
              ],
            ),
          );
        },
      ),
    );
  }
}
