import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import 'auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose(); _usernameCtrl.dispose();
    _passwordCtrl.dispose(); _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(authProvider.notifier).register(
        name: _nameCtrl.text.trim(), email: _emailCtrl.text.trim(),
        username: _usernameCtrl.text.trim(), password: _passwordCtrl.text,
      );
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              IconButton(icon: const Icon(LucideIcons.arrowLeft, color: AppColors.textPrimary), onPressed: () => context.pop()),
              const SizedBox(height: 8),
              Text('Create Account', style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text('Join Fund Manager', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted)),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.card, borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      AppInput(label: AppStrings.nameLabel, hintText: 'e.g. Priya Sharma', controller: _nameCtrl,
                        textInputAction: TextInputAction.next, validator: (v) => v?.isEmpty == true ? 'Name is required' : null),
                      const SizedBox(height: 16),
                      AppInput(label: AppStrings.emailLabel, hintText: 'you@email.com', controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress, textInputAction: TextInputAction.next,
                        validator: (v) => v?.isEmpty == true ? 'Email is required' : null),
                      const SizedBox(height: 16),
                      AppInput(label: AppStrings.usernameLabel, hintText: 'priya_s', controller: _usernameCtrl,
                        textInputAction: TextInputAction.next, validator: (v) {
                          if (v?.isEmpty == true) return 'Username is required';
                          if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(v!)) return 'Letters, numbers and underscores only';
                          return null;
                        }),
                      const SizedBox(height: 16),
                      AppInput(label: AppStrings.passwordLabel, hintText: 'Min. 6 characters', controller: _passwordCtrl,
                        obscureText: true, textInputAction: TextInputAction.next,
                        validator: (v) => (v?.length ?? 0) < 6 ? 'Min 6 characters' : null),
                      const SizedBox(height: 16),
                      AppInput(label: AppStrings.confirmPasswordLabel, hintText: 'Repeat password', controller: _confirmCtrl,
                        obscureText: true, textInputAction: TextInputAction.done,
                        validator: (v) => v != _passwordCtrl.text ? 'Passwords do not match' : null),
                      const SizedBox(height: 24),
                      AppButton(label: AppStrings.createAccount, onPressed: _submit, loading: _loading, fullWidth: true),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: GestureDetector(
                  onTap: () => context.pop(),
                  child: Text.rich(TextSpan(
                    text: 'Already have an account? ',
                    style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary),
                    children: [TextSpan(text: 'Sign In', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppColors.primaryHover))],
                  )),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
