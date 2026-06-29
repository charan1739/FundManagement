import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import 'profile_provider.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});
  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() { _currentCtrl.dispose(); _newCtrl.dispose(); _confirmCtrl.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (_newCtrl.text.length < 6) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Min 6 characters'), backgroundColor: AppColors.danger)); return; }
    if (_newCtrl.text != _confirmCtrl.text) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Passwords do not match'), backgroundColor: AppColors.danger)); return; }
    setState(() => _loading = true);
    try {
      await ref.read(profileProvider.notifier).changePassword(_currentCtrl.text, _newCtrl.text);
      if (mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password updated'), backgroundColor: AppColors.success)); context.pop(); }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
    } finally { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.surface,
    appBar: AppBar(leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()), title: const Text(AppStrings.changePassword)),
    body: ListView(padding: const EdgeInsets.all(16), children: [
      AppInput(label: AppStrings.currentPasswordLabel, controller: _currentCtrl, obscureText: true),
      const SizedBox(height: 16),
      AppInput(label: AppStrings.newPasswordLabel, controller: _newCtrl, obscureText: true),
      const SizedBox(height: 16),
      AppInput(label: AppStrings.confirmPasswordLabel, controller: _confirmCtrl, obscureText: true),
      const SizedBox(height: 24),
      AppButton(label: 'Update Password', fullWidth: true, loading: _loading, onPressed: _save),
    ]),
  );
}
