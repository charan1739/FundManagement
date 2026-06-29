import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format_inr.dart';
import '../../../core/utils/format_ist.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import 'request_provider.dart';

const _filters = ['all', 'pending', 'approved', 'transferred', 'completed', 'rejected'];

class ManageRequestsScreen extends ConsumerStatefulWidget {
  final String groupId;
  const ManageRequestsScreen({super.key, required this.groupId});

  @override
  ConsumerState<ManageRequestsScreen> createState() => _ManageRequestsScreenState();
}

class _ManageRequestsScreenState extends ConsumerState<ManageRequestsScreen> {
  String _selected = 'all';

  @override
  Widget build(BuildContext context) {
    final reqAsync = ref.watch(requestProvider(widget.groupId));
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()),
        title: const Text('Manage Requests'),
      ),
      body: Column(children: [
        // Filter chips
        Container(
          color: AppColors.card,
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: _filters.map((f) {
                final active = _selected == f;
                return GestureDetector(
                  onTap: () {
                    setState(() => _selected = f);
                    ref.read(requestProvider(widget.groupId).notifier).filterByStatus(f == 'all' ? null : f);
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: active ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: active ? AppColors.primary : AppColors.accent),
                    ),
                    child: Text(
                      f == 'all' ? 'All' : '${f[0].toUpperCase()}${f.substring(1)}',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: active ? AppColors.textPrimary : AppColors.textSecondary),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        Expanded(child: reqAsync.when(
          loading: () => ListView(children: List.generate(3, (_) => const SkeletonTransactionItem())),
          error: (e, _) => Center(child: Text(e.toString())),
          data: (requests) => requests.isEmpty
              ? EmptyState(icon: LucideIcons.fileText, title: _selected == 'all' ? 'No fund requests yet' : 'No ${_selected} requests')
              : RefreshIndicator(
                  onRefresh: () => ref.read(requestProvider(widget.groupId).notifier).refresh(status: _selected == 'all' ? null : _selected),
                  color: AppColors.primary,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: requests.length,
                    itemBuilder: (ctx, i) {
                      final req = requests[i];
                      return GestureDetector(
                        onTap: () => context.push('/requests/${req.id}'),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border),
                            boxShadow: [BoxShadow(color: AppColors.textPrimary.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))]),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Row(children: [
                                CircleAvatar(radius: 14, backgroundColor: AppColors.accent, child: Text(req.requestedBy.name[0], style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary))),
                                const SizedBox(width: 8),
                                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(req.requestedBy.name, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
                                  Text(formatISTDate(req.createdAt), style: GoogleFonts.inter(fontSize: 10, color: AppColors.textMuted)),
                                ]),
                              ]),
                              AppBadge.status(req.status),
                            ]),
                            const SizedBox(height: 12),
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Expanded(child: Text(req.purpose, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary), overflow: TextOverflow.ellipsis)),
                              const SizedBox(width: 12),
                              Text(formatINR(req.amount), style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFeatures: [const FontFeature.tabularFigures()])),
                            ]),
                            if (req.description != null) ...[
                              const SizedBox(height: 4),
                              Text(req.description!, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                            ],
                          ]),
                        ),
                      );
                    },
                  ),
                ),
        )),
      ]),
    );
  }
}
