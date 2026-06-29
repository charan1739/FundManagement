import 'package:image_picker/image_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import '../../../shared/widgets/file_upload_widget.dart';
import '../data/request_repository.dart';

class RaiseRequestScreen extends ConsumerStatefulWidget {
  final String groupId;
  const RaiseRequestScreen({super.key, required this.groupId});

  @override
  ConsumerState<RaiseRequestScreen> createState() => _RaiseRequestScreenState();
}

class _RaiseRequestScreenState extends ConsumerState<RaiseRequestScreen> {
  final _amountCtrl = TextEditingController();
  final _purposeCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  DateTime? _requiredDate;
  XFile? _attachmentFile;
  bool _loading = false;

  @override
  void dispose() {
    _amountCtrl.dispose(); _purposeCtrl.dispose(); _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(colorScheme: const ColorScheme.light(primary: AppColors.primary)),
        child: child!,
      ),
    );
    if (date != null) setState(() => _requiredDate = date);
  }

  Future<void> _submit() async {
    final amount = double.tryParse(_amountCtrl.text) ?? 0;
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid amount'), backgroundColor: AppColors.danger));
      return;
    }
    if (_purposeCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Purpose is required'), backgroundColor: AppColors.danger));
      return;
    }
    setState(() => _loading = true);
    try {
      await RequestRepository().createRequest(
        groupId: widget.groupId,
        amount: amount,
        purpose: _purposeCtrl.text.trim(),
        description: _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        requiredDate: _requiredDate?.toIso8601String(),
        attachmentPath: _attachmentFile?.path,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Request submitted'), backgroundColor: AppColors.success));
        context.pop();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit = (double.tryParse(_amountCtrl.text) ?? 0) > 0 && _purposeCtrl.text.trim().isNotEmpty;
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()),
        title: const Text('Request Funds'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.border)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(AppStrings.amountLabel, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
            const SizedBox(height: 6),
            TextFormField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: false),
              onChanged: (_) => setState(() {}),
              style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFeatures: [const FontFeature.tabularFigures()]),
              decoration: InputDecoration(prefixText: '₹ ', prefixStyle: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textMuted), hintText: '0'),
            ),
            const SizedBox(height: 20),
            AppInput(label: '${AppStrings.purposeLabel} *', hintText: 'e.g. Printer cartridges', controller: _purposeCtrl, maxLength: 100, onChanged: (_) => setState(() {})),
            const SizedBox(height: 16),
            AppInput(label: AppStrings.descriptionLabel, hintText: 'Explain why you need this...', controller: _descCtrl, maxLines: 3, maxLength: 200),
            const SizedBox(height: 16),
            // Date picker
            GestureDetector(
              onTap: _pickDate,
              child: AbsorbPointer(
                child: AppInput(
                  label: AppStrings.requiredDateLabel,
                  hintText: 'Tap to select date',
                  controller: TextEditingController(text: _requiredDate != null ? '${_requiredDate!.day}/${_requiredDate!.month}/${_requiredDate!.year}' : ''),
                  readOnly: true,
                  suffixWidget: const Icon(LucideIcons.calendar, size: 18, color: AppColors.textMuted),
                ),
              ),
            ),
            const SizedBox(height: 16),
            FileUploadWidget(
              label: AppStrings.attachDocument,
              file: _attachmentFile,
              onFilePicked: (f) => setState(() => _attachmentFile = f),
              onFileRemoved: () => setState(() => _attachmentFile = null),
            ),
            const SizedBox(height: 24),
            AppButton(label: AppStrings.submitRequest, fullWidth: true, loading: _loading, onPressed: canSubmit ? _submit : null),
          ]),
        ),
      ),
    );
  }
}
