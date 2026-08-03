import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import '../../auth/data/auth_repository.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String token;
  const ResetPasswordScreen({super.key, required this.token});

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _passwordCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _submit() async {
    final password = _passwordCtrl.text;
    if (password.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password must be at least 6 characters'), backgroundColor: AppColors.danger));
      return;
    }
    setState(() => _loading = true);
    
    try {
      final dio = ref.read(dioProvider);
      await dio.put(ApiConstants.resetPassword(widget.token), data: {'password': password});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset successfully'), backgroundColor: AppColors.success));
        context.go('/login');
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data['message'] ?? 'Failed to reset password'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.go('/login'))),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 20),
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                child: const Icon(LucideIcons.lock, size: 36, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 20),
              Text('New Password', style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 6),
              Text('Enter your new password below', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted)),
              const SizedBox(height: 40),
              
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [BoxShadow(color: AppColors.textPrimary.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: Column(
                  children: [
                    AppInput(
                      label: 'New Password',
                      hintText: '••••••••',
                      controller: _passwordCtrl,
                      obscureText: true,
                    ),
                    const SizedBox(height: 24),
                    AppButton(label: 'Reset Password', onPressed: _submit, loading: _loading, fullWidth: true),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
