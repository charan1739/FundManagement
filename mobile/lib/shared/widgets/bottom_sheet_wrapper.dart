import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import 'app_button.dart';

class AppBottomSheet extends StatelessWidget {
  final String title;
  final Widget content;
  final Widget? stickyBottom;
  final bool isScrollable;

  const AppBottomSheet({
    super.key,
    required this.title,
    required this.content,
    this.stickyBottom,
    this.isScrollable = true,
  });

  static Future<T?> show<T>(
    BuildContext context, {
    required String title,
    required Widget content,
    Widget? stickyBottom,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AppBottomSheet(title: title, content: content, stickyBottom: stickyBottom),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.95,
      minChildSize: 0.3,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              // Title
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 8, 8),
                child: Row(
                  children: [
                    Expanded(child: Text(title, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary))),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textMuted),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.accent),
              // Content
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                  child: content,
                ),
              ),
              // Sticky bottom
              if (stickyBottom != null)
                Container(
                  padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide(color: AppColors.accent)),
                    color: AppColors.card,
                  ),
                  child: stickyBottom!,
                ),
            ],
          ),
        );
      },
    );
  }
}
