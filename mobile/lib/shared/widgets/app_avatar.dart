import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/avatar_color.dart';
import 'package:google_fonts/google_fonts.dart';

class AppAvatar extends StatelessWidget {
  final String name;
  final double size;

  const AppAvatar({super.key, required this.name, this.size = 40});

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: avatarColor(name),
      child: Text(
        getInitials(name),
        style: GoogleFonts.inter(
          fontSize: size * 0.34,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }
}
