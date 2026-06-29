import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

class AppInput extends StatefulWidget {
  final String label;
  final String? hintText;
  final TextEditingController? controller;
  final String? errorText;
  final bool obscureText;
  final int? maxLength;
  final int? maxLines;
  final TextInputType? keyboardType;
  final Widget? prefixWidget;
  final Widget? suffixWidget;
  final bool readOnly;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final String? Function(String?)? validator;
  final FocusNode? focusNode;
  final TextInputAction? textInputAction;

  const AppInput({
    super.key,
    required this.label,
    this.hintText,
    this.controller,
    this.errorText,
    this.obscureText = false,
    this.maxLength,
    this.maxLines = 1,
    this.keyboardType,
    this.prefixWidget,
    this.suffixWidget,
    this.readOnly = false,
    this.onTap,
    this.onChanged,
    this.validator,
    this.focusNode,
    this.textInputAction,
  });

  @override
  State<AppInput> createState() => _AppInputState();
}

class _AppInputState extends State<AppInput> {
  late bool _obscure;

  @override
  void initState() {
    super.initState();
    _obscure = widget.obscureText;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
        const SizedBox(height: 6),
        TextFormField(
          controller: widget.controller,
          obscureText: _obscure,
          maxLength: widget.maxLength,
          maxLines: widget.obscureText ? 1 : widget.maxLines,
          keyboardType: widget.keyboardType,
          readOnly: widget.readOnly,
          onTap: widget.onTap,
          onChanged: widget.onChanged,
          validator: widget.validator,
          focusNode: widget.focusNode,
          textInputAction: widget.textInputAction,
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.textPrimary),
          buildCounter: widget.maxLength != null
              ? (context, {required currentLength, required isFocused, maxLength}) =>
                  Text('$currentLength/${maxLength ?? ''}',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted))
              : null,
          decoration: InputDecoration(
            hintText: widget.hintText,
            errorText: widget.errorText,
            prefixIcon: widget.prefixWidget,
            suffixIcon: widget.obscureText
                ? IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: AppColors.textMuted, size: 20),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  )
                : widget.suffixWidget,
          ),
        ),
      ],
    );
  }
}
