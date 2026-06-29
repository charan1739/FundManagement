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
import '../../funds/data/fund_repository.dart';
import '../../groups/presentation/group_provider.dart';

class AddFundScreen extends ConsumerStatefulWidget {
  final String groupId;
  const AddFundScreen({super.key, required this.groupId});

  @override
  ConsumerState<AddFundScreen> createState() => _AddFundScreenState();
}

class _AddFundScreenState extends ConsumerState<AddFundScreen> {
  final _amountCtrl = TextEditingController();
  final _sourceCtrl = TextEditingController();
  final _remarksCtrl = TextEditingController();
  XFile? _proofFile;
  bool _loading = false;

  @override
  void dispose() {
    _amountCtrl.dispose(); _sourceCtrl.dispose(); _remarksCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final amount = double.tryParse(_amountCtrl.text) ?? 0;
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid amount'), backgroundColor: AppColors.danger));
      return;
    }
    setState(() => _loading = true);
    try {
      await FundRepository().addFunds(
        groupId: widget.groupId,
        amount: amount,
        source: _sourceCtrl.text.trim().isEmpty ? null : _sourceCtrl.text.trim(),
        remarks: _remarksCtrl.text.trim().isEmpty ? null : _remarksCtrl.text.trim(),
        proofPath: _proofFile?.path,
      );
      ref.invalidate(groupDetailProvider(widget.groupId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('₹${amount.toStringAsFixed(0)} added successfully'), backgroundColor: AppColors.success));
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
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()),
        title: const Text('Add Funds'),
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
              style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFeatures: [const FontFeature.tabularFigures()]),
              decoration: InputDecoration(prefixText: '₹ ', prefixStyle: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textMuted), hintText: '0'),
            ),
            const SizedBox(height: 20),
            AppInput(label: AppStrings.sourceLabel, hintText: 'e.g. Client payment', controller: _sourceCtrl),
            const SizedBox(height: 16),
            AppInput(label: AppStrings.remarksLabel, hintText: 'Any additional notes...', controller: _remarksCtrl, maxLines: 3, maxLength: 200),
            const SizedBox(height: 16),
            FileUploadWidget(
              label: AppStrings.attachProof,
              file: _proofFile,
              onFilePicked: (f) => setState(() => _proofFile = f),
              onFileRemoved: () => setState(() => _proofFile = null),
            ),
            const SizedBox(height: 24),
            AppButton(label: AppStrings.addFundsButton, variant: AppButtonVariant.success, fullWidth: true, loading: _loading, onPressed: _submit),
          ]),
        ),
      ),
    );
  }
}
