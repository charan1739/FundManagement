import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import 'app_button.dart';

Future<bool?> showConfirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  String confirmLabel = 'Confirm',
  String cancelLabel = 'Cancel',
  AppButtonVariant confirmVariant = AppButtonVariant.danger,
  Widget? extraContent,
}) {
  return showDialog<bool>(
    context: context,
    builder: (ctx) => _ConfirmDialog(
      title: title,
      message: message,
      confirmLabel: confirmLabel,
      cancelLabel: cancelLabel,
      confirmVariant: confirmVariant,
      extraContent: extraContent,
    ),
  );
}

class _ConfirmDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmLabel;
  final String cancelLabel;
  final AppButtonVariant confirmVariant;
  final Widget? extraContent;

  const _ConfirmDialog({
    required this.title,
    required this.message,
    required this.confirmLabel,
    required this.cancelLabel,
    required this.confirmVariant,
    this.extraContent,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.card,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(title, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(message, style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary)),
          if (extraContent != null) ...[const SizedBox(height: 16), extraContent!],
        ],
      ),
      actionsAlignment: MainAxisAlignment.spaceBetween,
      actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      actions: [
        Row(
          children: [
            Expanded(
              child: AppButton(label: cancelLabel, variant: AppButtonVariant.ghost, fullWidth: true, onPressed: () => Navigator.of(context).pop(false)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppButton(label: confirmLabel, variant: confirmVariant, fullWidth: true, onPressed: () => Navigator.of(context).pop(true)),
            ),
          ],
        ),
      ],
    );
  }
}
