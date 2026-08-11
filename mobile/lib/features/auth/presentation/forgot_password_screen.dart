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
import '../../../core/network/dio_client.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) return;
    setState(() => _loading = true);
    
    try {
      final dio = DioClient.instance.dio;
      await dio.post(ApiConstants.forgotPassword, data: {'email': email});
      if (mounted) setState(() => _sent = true);
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data['message'] ?? 'Failed to send email'), backgroundColor: AppColors.danger),
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
      appBar: AppBar(leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop())),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 20),
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                child: const Icon(LucideIcons.mail, size: 36, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 20),
              Text('Reset Password', style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 6),
              Text('We\'ll send you a link to reset it', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted)),
              const SizedBox(height: 40),
              
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [BoxShadow(color: AppColors.textPrimary.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: _sent ? Column(
                  children: [
                    Text('If an account exists for ${_emailCtrl.text}, you will receive a password reset link shortly.', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textPrimary), textAlign: TextAlign.center),
                    const SizedBox(height: 24),
                    AppButton(label: 'Return to Login', onPressed: () => context.go('/login'), fullWidth: true, variant: AppButtonVariant.secondary),
                  ],
                ) : Column(
                  children: [
                    AppInput(
                      label: AppStrings.emailLabel,
                      hintText: 'you@email.com',
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 24),
                    AppButton(label: 'Send Reset Link', onPressed: _submit, loading: _loading, fullWidth: true),
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
