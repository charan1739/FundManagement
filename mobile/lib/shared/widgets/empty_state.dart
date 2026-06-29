import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import 'app_button.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? ctaLabel;
  final VoidCallback? onCta;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.ctaLabel,
    this.onCta,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 64, horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.25),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 32, color: AppColors.secondary),
          ),
          const SizedBox(height: 16),
          Text(title, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary), textAlign: TextAlign.center),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(subtitle!, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted), textAlign: TextAlign.center),
          ],
          if (ctaLabel != null && onCta != null) ...[
            const SizedBox(height: 20),
            AppButton(label: ctaLabel!, onPressed: onCta),
          ],
        ],
      ),
    );
  }
}
