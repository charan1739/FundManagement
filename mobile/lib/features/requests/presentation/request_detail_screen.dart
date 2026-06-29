import 'package:image_picker/image_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format_inr.dart';
import '../../../core/utils/format_ist.dart';
import '../../../core/socket/socket_service.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/bottom_sheet_wrapper.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../../shared/widgets/status_timeline.dart';
import '../../../shared/widgets/file_upload_widget.dart';
import '../../../shared/widgets/app_input.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../groups/presentation/group_provider.dart';
import 'request_provider.dart';

class RequestDetailScreen extends ConsumerStatefulWidget {
  final String requestId;
  const RequestDetailScreen({super.key, required this.requestId});

  @override
  ConsumerState<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends ConsumerState<RequestDetailScreen> {
  XFile? _receiptFile;

  @override
  void initState() {
    super.initState();
    SocketService.instance.events.listen((evt) {
      if (!mounted) return;
      if (evt.event == SocketEvent.requestStatusChanged && evt.data['requestId'] == widget.requestId) {
        ref.invalidate(requestDetailProvider(widget.requestId));
      }
    });
  }

  Future<void> _handleAction(String action, {String? rejectReason}) async {
    final notifier = ref.read(requestDetailProvider(widget.requestId).notifier);
    try {
      switch (action) {
        case 'approve': await notifier.approve(); break;
        case 'reject': if (rejectReason != null) await notifier.reject(rejectReason); break;
        case 'transfer': await notifier.transfer(); break;
        case 'confirm': await notifier.confirm(receiptPath: _receiptFile?.path); break;
      }
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Action successful'), backgroundColor: AppColors.success));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
    }
  }

  Future<void> _showRejectSheet() async {
    final reasonCtrl = TextEditingController();
    await AppBottomSheet.show(
      context,
      title: 'Reject Request',
      content: AppInput(label: 'Reason for rejection *', hintText: 'Explain why...', controller: reasonCtrl, maxLines: 3, maxLength: 200),
      stickyBottom: AppButton(
        label: 'Reject Request', variant: AppButtonVariant.danger, fullWidth: true,
        onPressed: () async {
          if (reasonCtrl.text.trim().isEmpty) return;
          Navigator.pop(context);
          await _handleAction('reject', rejectReason: reasonCtrl.text.trim());
        },
      ),
    );
  }

  Future<void> _showConfirmReceiptSheet() async {
    await AppBottomSheet.show(
      context,
      title: 'Confirm Receipt',
      content: Column(children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12)),
          child: Text('By confirming, you acknowledge receipt of funds. The balance will be updated permanently.', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
        ),
        const SizedBox(height: 16),
        FileUploadWidget(
          label: 'Attach receipt (optional)',
          file: _receiptFile,
          onFilePicked: (f) => setState(() => _receiptFile = f),
          onFileRemoved: () => setState(() => _receiptFile = null),
        ),
      ]),
      stickyBottom: AppButton(
        label: 'I have received the funds', variant: AppButtonVariant.success, fullWidth: true,
        onPressed: () async {
          Navigator.pop(context);
          await _handleAction('confirm');
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final reqAsync = ref.watch(requestDetailProvider(widget.requestId));
    final currentUser = ref.watch(authProvider).valueOrNull;

    return reqAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary))),
      error: (e, _) => Scaffold(
        backgroundColor: AppColors.surface,
        appBar: AppBar(leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop())),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(
                width: 64, height: 64,
                decoration: BoxDecoration(color: AppColors.danger.withOpacity(0.1), shape: BoxShape.circle),
                child: const Icon(LucideIcons.wifiOff, size: 28, color: AppColors.danger),
              ),
              const SizedBox(height: 16),
              Text('Could not load request', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Text('Check your connection and try again.', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted), textAlign: TextAlign.center),
              const SizedBox(height: 24),
              AppButton(label: 'Retry', variant: AppButtonVariant.secondary, icon: const Icon(LucideIcons.refreshCw, size: 16),
                onPressed: () => ref.invalidate(requestDetailProvider(widget.requestId))),
            ]),
          ),
        ),
      ),
      data: (req) {
        final isRequester = req.requestedBy.id == currentUser?.id;
        // Determine admin from actual group membership — admins see approve/reject/transfer
        // members only see confirm receipt on their own transferred requests
        // req.group is only populated on the getRequestById endpoint
        final groupId = req.group?.id;
        final isGroupAdmin = groupId != null
            ? (ref.watch(groupDetailProvider(groupId)).valueOrNull?.isAdmin ?? false)
            : false;
        final canActAsAdmin = isGroupAdmin && !isRequester;
        return Scaffold(
          backgroundColor: AppColors.surface,
          appBar: AppBar(
            leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()),
            title: const Text('Fund Request'),
          ),
          body: Stack(children: [
            ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    AppBadge.status(req.status),
                    Text(formatISTDate(req.createdAt), style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
                  ]),
                  const SizedBox(height: 16),
                  Text(formatINR(req.amount), style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFeatures: [const FontFeature.tabularFigures()])),
                  const SizedBox(height: 4),
                  Text(req.purpose, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                  if (req.description != null) ...[
                    const SizedBox(height: 8),
                    Text(req.description!, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                  const SizedBox(height: 16),
                  Row(children: [
                    AppAvatar(name: req.requestedBy.name, size: 40),
                    const SizedBox(width: 10),
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Requested by', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                      Text(req.requestedBy.name, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    ]),
                  ]),
                ]),
              ),
              const SizedBox(height: 16),
              // Timeline
              Container(
                decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
                    child: Text('Status Timeline', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                  ),
                  StatusTimeline(request: req),
                  if (req.status == 'rejected' && req.rejectedReason != null)
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.danger.withOpacity(0.08), borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.danger.withOpacity(0.25))),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Rejection Reason', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.danger)),
                        const SizedBox(height: 4),
                        Text(req.rejectedReason!, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
                      ]),
                    ),
                ]),
              ),
              // Attachments
              if (req.attachmentUrl != null || req.receiptUrl != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Documents', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    const SizedBox(height: 12),
                    if (req.attachmentUrl != null) _DocTile('Supporting Document', req.attachmentUrl!, LucideIcons.paperclip, AppColors.primaryHover),
                    if (req.receiptUrl != null) _DocTile('Receipt', req.receiptUrl!, LucideIcons.checkCircle, AppColors.success),
                  ]),
                ),
              ],
            ]),
            // Sticky bottom actions
            Positioned(
              bottom: 0, left: 0, right: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                decoration: const BoxDecoration(color: AppColors.card, border: Border(top: BorderSide(color: AppColors.accent))),
                child: _buildActions(req, isRequester, canActAsAdmin),
              ),
            ),
          ]),
        );
      },
    );
  }

  Widget _buildActions(req, bool isRequester, bool canActAsAdmin) {
    if (canActAsAdmin && req.status == 'pending') {
      return Row(children: [
        Expanded(child: AppButton(label: 'Reject', variant: AppButtonVariant.danger, fullWidth: true, icon: const Icon(LucideIcons.xCircle, size: 16), onPressed: _showRejectSheet)),
        const SizedBox(width: 12),
        Expanded(child: AppButton(label: 'Approve', variant: AppButtonVariant.success, fullWidth: true, icon: const Icon(LucideIcons.checkCircle, size: 16), onPressed: () async {
          final ok = await showConfirmDialog(context, title: 'Approve Request', message: 'Approve ${req.requestedBy.name}\'s request for ${formatINR(req.amount)}?', confirmLabel: 'Approve', confirmVariant: AppButtonVariant.success);
          if (ok == true) await _handleAction('approve');
        })),
      ]);
    }
    if (canActAsAdmin && req.status == 'approved') {
      return AppButton(label: 'Mark as Transferred', fullWidth: true, icon: const Icon(LucideIcons.arrowUpRight, size: 16), onPressed: () async {
        final ok = await showConfirmDialog(context, title: 'Mark Transferred', message: 'Confirm that ₹${req.amount} has been transferred to ${req.requestedBy.name}?', confirmLabel: 'Yes, Transferred');
        if (ok == true) await _handleAction('transfer');
      });
    }
    if (isRequester && req.status == 'transferred') {
      return AppButton(label: 'I have received the funds', variant: AppButtonVariant.success, fullWidth: true, icon: const Icon(LucideIcons.check, size: 16), onPressed: _showConfirmReceiptSheet);
    }
    return const SizedBox.shrink();
  }
}

class _DocTile extends StatelessWidget {
  final String label;
  final String url;
  final IconData icon;
  final Color color;

  const _DocTile(this.label, this.url, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => launchUrl(Uri.parse(url)),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.accent)),
        child: Row(children: [
          Container(width: 36, height: 36, decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 18, color: color)),
          const SizedBox(width: 10),
          Text(label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
          const Spacer(),
          const Icon(LucideIcons.externalLink, size: 14, color: AppColors.textMuted),
        ]),
      ),
    );
  }
}
