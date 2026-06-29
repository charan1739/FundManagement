import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(authProvider.notifier).login(_emailCtrl.text.trim(), _passwordCtrl.text);
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger),
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 60),
              // Logo
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                child: const Icon(LucideIcons.wallet, size: 36, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 20),
              Text(AppStrings.appName, style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 6),
              Text(AppStrings.appTagline, style: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted)),
              const SizedBox(height: 40),
              // Form card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [BoxShadow(color: AppColors.textPrimary.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      AppInput(
                        label: AppStrings.emailLabel,
                        hintText: 'you@email.com',
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        validator: (v) => v?.isEmpty == true ? 'Email is required' : null,
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: AppStrings.passwordLabel,
                        hintText: '••••••••',
                        controller: _passwordCtrl,
                        obscureText: true,
                        textInputAction: TextInputAction.done,
                        validator: (v) => v?.isEmpty == true ? 'Password is required' : null,
                      ),
                      const SizedBox(height: 24),
                      AppButton(label: AppStrings.signIn, onPressed: _submit, loading: _loading, fullWidth: true),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              const SizedBox(height: 24),
              GestureDetector(
                onTap: () => context.push('/register'),
                child: Text.rich(TextSpan(
                  text: 'New user? ',
                  style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary),
                  children: [
                    TextSpan(text: 'Create account', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primaryHover)),
                  ],
                )),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
