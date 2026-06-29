import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import '../../auth/presentation/auth_provider.dart';
import 'profile_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});
  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).valueOrNull;
    _nameCtrl = TextEditingController(text: user?.name ?? '');
    _phoneCtrl = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      final updated = await ref.read(profileProvider.notifier).updateProfile(name: _nameCtrl.text.trim(), phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim());
      await ref.read(authProvider.notifier).updateUser(updated);
      if (mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated'), backgroundColor: AppColors.success)); context.pop(); }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).valueOrNull;
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()), title: const Text(AppStrings.editProfile)),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        AppInput(label: AppStrings.nameLabel, controller: _nameCtrl),
        const SizedBox(height: 16),
        AppInput(label: AppStrings.phoneLabel, controller: _phoneCtrl, keyboardType: TextInputType.phone),
        const SizedBox(height: 16),
        AppInput(label: AppStrings.emailLabel, controller: TextEditingController(text: user?.email ?? ''), readOnly: true),
        const SizedBox(height: 16),
        AppInput(label: AppStrings.usernameLabel, controller: TextEditingController(text: user?.username ?? ''), readOnly: true),
        const SizedBox(height: 24),
        AppButton(label: AppStrings.saveChanges, fullWidth: true, loading: _loading, onPressed: _save),
      ]),
    );
  }
}
