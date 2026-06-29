import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_strings.dart';

class FileUploadWidget extends StatelessWidget {
  final String label;
  final XFile? file;
  final ValueChanged<XFile> onFilePicked;
  final VoidCallback onFileRemoved;
  final bool disabled;

  const FileUploadWidget({
    super.key,
    required this.label,
    required this.file,
    required this.onFilePicked,
    required this.onFileRemoved,
    this.disabled = false,
  });

  Future<void> _pick(BuildContext context) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked == null) return;
    
    final length = await picked.length();
    if (length > 5 * 1024 * 1024) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.fileTooLarge), backgroundColor: AppColors.danger),
      );
      return;
    }
    onFilePicked(picked);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
        const SizedBox(height: 8),
        if (file != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.accent.withOpacity(0.5),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.accent),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.paperclip, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Expanded(child: Text(file!.name, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary), overflow: TextOverflow.ellipsis)),
                IconButton(
                  padding: EdgeInsets.zero, constraints: const BoxConstraints(),
                  icon: const Icon(LucideIcons.x, size: 16, color: AppColors.textMuted),
                  onPressed: disabled ? null : onFileRemoved,
                ),
              ],
            ),
          )
        else
          InkWell(
            onTap: disabled ? null : () => _pick(context),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.accent, style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(12),
                color: AppColors.surface,
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.paperclip, size: 16, color: AppColors.textMuted),
                  const SizedBox(width: 8),
                  Text('Attach JPG or PNG (max 5 MB)', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted)),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
