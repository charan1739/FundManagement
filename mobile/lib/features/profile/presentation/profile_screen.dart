import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/utils/avatar_color.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import '../../../shared/widgets/bottom_sheet_wrapper.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../auth/presentation/auth_provider.dart';
import 'profile_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).valueOrNull;
    if (user == null) return const Scaffold(backgroundColor: AppColors.surface, body: Center(child: CircularProgressIndicator(color: AppColors.primary)));

    final initials = getInitials(user.name);
    final color = avatarColor(user.name);

    Future<void> handleLogout() async {
      final ok = await showConfirmDialog(context, title: AppStrings.signOut, message: 'Are you sure you want to log out?', confirmLabel: AppStrings.signOut, confirmVariant: AppButtonVariant.ghost);
      if (ok == true) {
        await ref.read(authProvider.notifier).logout();
        if (context.mounted) context.go('/login');
      }
    }

    Future<void> handleDelete() async {
      final confirmCtrl = TextEditingController();
      final ok = await showConfirmDialog(context,
        title: AppStrings.deleteAccount,
        message: 'This is permanent and cannot be undone. All your data will be erased.',
        confirmLabel: 'Delete Account',
        confirmVariant: AppButtonVariant.danger,
        extraContent: AppInput(label: AppStrings.typeDeleteConfirm, hintText: 'DELETE', controller: confirmCtrl),
      );
      if (ok == true && confirmCtrl.text == 'DELETE') {
        await ref.read(profileProvider.notifier).deleteAccount();
        await ref.read(authProvider.notifier).logout();
        if (context.mounted) context.go('/login');
      }
    }

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text(AppStrings.profileTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar header
          Center(child: Column(children: [
            CircleAvatar(radius: 44, backgroundColor: color, child: Text(initials, style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary))),
            const SizedBox(height: 12),
            Text(user.name, style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            Text('@${user.username}', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted)),
            Text(user.email, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
            const SizedBox(height: 12),
            AppButton(label: AppStrings.editProfile, variant: AppButtonVariant.secondary, icon: const Icon(LucideIcons.pencil, size: 16), onPressed: () => context.push('/profile/edit')),
          ])),
          const SizedBox(height: 24),

          // Menu items
          _MenuSection(items: [
            _MenuItem(icon: LucideIcons.fileText, label: AppStrings.myRequests, subtitle: 'View all your fund requests', onTap: () => context.push('/profile/requests')),
            _MenuItem(icon: LucideIcons.lock, label: AppStrings.changePassword, subtitle: 'Update your security credentials', onTap: () => context.push('/profile/password')),
          ]),
          const SizedBox(height: 16),
          _MenuSection(items: [
            _MenuItem(icon: LucideIcons.logOut, label: AppStrings.signOut, onTap: handleLogout),
          ]),
          const SizedBox(height: 24),
          Center(child: TextButton.icon(
            onPressed: handleDelete,
            icon: const Icon(LucideIcons.trash2, size: 16, color: AppColors.danger),
            label: Text(AppStrings.deleteAccount, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.danger)),
          )),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final List<_MenuItem> items;
  const _MenuSection({required this.items});

  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
    child: Column(
      children: items.asMap().entries.map((entry) {
        final i = entry.key; final item = entry.value;
        return Column(children: [
          ListTile(
            leading: Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(10)),
              child: Icon(item.icon, size: 20, color: AppColors.textSecondary)),
            title: Text(item.label, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
            subtitle: item.subtitle != null ? Text(item.subtitle!, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)) : null,
            trailing: const Icon(LucideIcons.chevronRight, size: 18, color: AppColors.textMuted),
            onTap: item.onTap,
          ),
          if (i < items.length - 1) const Divider(height: 1, indent: 16, endIndent: 16),
        ]);
      }).toList(),
    ),
  );
}

class _MenuItem {
  final IconData icon;
  final String label;
  final String? subtitle;
  final VoidCallback? onTap;
  const _MenuItem({required this.icon, required this.label, this.subtitle, this.onTap});
}
