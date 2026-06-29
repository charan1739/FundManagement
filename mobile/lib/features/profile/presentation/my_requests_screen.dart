import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/utils/format_inr.dart';
import '../../../core/utils/format_ist.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../requests/presentation/request_provider.dart';

class MyRequestsScreen extends ConsumerWidget {
  const MyRequestsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reqAsync = ref.watch(myRequestsProvider);
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()), title: const Text(AppStrings.myRequests)),
      body: reqAsync.when(
        loading: () => ListView(children: List.generate(3, (_) => const SkeletonTransactionItem())),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (requests) => requests.isEmpty
            ? const EmptyState(icon: LucideIcons.fileText, title: 'No requests yet', subtitle: 'You have not made any fund requests.')
            : RefreshIndicator(
                onRefresh: () => ref.refresh(myRequestsProvider.future),
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
                            if (req.group != null) Text(req.group!.name, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryHover)),
                            AppBadge.status(req.status),
                          ]),
                          const SizedBox(height: 8),
                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                            Expanded(child: Text(req.purpose, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary), overflow: TextOverflow.ellipsis)),
                            const SizedBox(width: 12),
                            Text(formatINR(req.amount), style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFeatures: [const FontFeature.tabularFigures()])),
                          ]),
                          const SizedBox(height: 4),
                          Text(formatISTDate(req.createdAt), style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                        ]),
                      ),
                    );
                  },
                ),
              ),
      ),
    );
  }
}
