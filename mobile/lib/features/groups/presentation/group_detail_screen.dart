import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/utils/format_inr.dart';
import '../../../core/utils/format_ist.dart';
import '../../../core/socket/socket_service.dart';
import '../../../core/socket/socket_provider.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../../shared/widgets/bottom_sheet_wrapper.dart';
import '../../../shared/widgets/app_input.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../groups/presentation/group_provider.dart';
import '../../funds/presentation/fund_provider.dart';
import '../../auth/presentation/auth_provider.dart';
import '../models/transaction_model.dart';
import '../models/activity_model.dart';
import '../models/member_model.dart';
import 'widgets/add_member_sheet.dart';

class GroupDetailScreen extends ConsumerStatefulWidget {
  final String groupId;
  const GroupDetailScreen({super.key, required this.groupId});

  @override
  ConsumerState<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends ConsumerState<GroupDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  bool _showRefreshBanner = false;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    SocketService.instance.joinGroup(widget.groupId);
    _listenSocket();
  }

  void _listenSocket() {
    SocketService.instance.events.listen((evt) {
      if (!mounted) return;
      if (evt.event == SocketEvent.groupActivity && evt.data['groupId'] == widget.groupId) {
        setState(() => _showRefreshBanner = true);
      }
      if (evt.event == SocketEvent.balanceUpdated && evt.data['groupId'] == widget.groupId) {
        ref.invalidate(groupDetailProvider(widget.groupId));
      }
    });
  }

  @override
  void dispose() {
    SocketService.instance.leaveGroup(widget.groupId);
    _tabCtrl.dispose();
    super.dispose();
  }

  void _handleRefresh() {
    setState(() => _showRefreshBanner = false);
    ref.invalidate(groupDetailProvider(widget.groupId));
    ref.invalidate(transactionProvider(widget.groupId));
    ref.invalidate(activityProvider(widget.groupId));
    ref.invalidate(membersProvider(widget.groupId));
  }

  @override
  Widget build(BuildContext context) {
    final groupAsync = ref.watch(groupDetailProvider(widget.groupId));
    final user = ref.watch(authProvider).valueOrNull;

    return groupAsync.when(
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
              Text('Could not load group', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Text('Check your connection and try again.', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted), textAlign: TextAlign.center),
              const SizedBox(height: 24),
              AppButton(label: 'Retry', variant: AppButtonVariant.secondary, icon: const Icon(LucideIcons.refreshCw, size: 16),
                onPressed: () => ref.invalidate(groupDetailProvider(widget.groupId))),
            ]),
          ),
        ),
      ),
      data: (group) {
        final isAdmin = group.isAdmin;
        return Scaffold(
          backgroundColor: AppColors.surface,
          appBar: AppBar(
            leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: () => context.pop()),
            title: Text(group.name, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
            actions: [
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: group.groupCode));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text(AppStrings.codeCopied), duration: Duration(seconds: 2)));
                },
                child: Container(
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.accent)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    // Use ConstrainedBox to prevent overflow of long group codes
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 90),
                      child: Text(
                        group.groupCode,
                        style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(LucideIcons.copy, size: 13, color: AppColors.textMuted),
                  ]),
                ),
              ),
            ],
          ),
          body: Column(children: [
            // Balance Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
              color: AppColors.bannerBg,
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(AppStrings.groupBalance, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 1)),
                const SizedBox(height: 4),
                Text(formatINR(group.currentBalance), style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFeatures: [const FontFeature.tabularFigures()])),
                const SizedBox(height: 12),
                Row(children: [
                  _BalanceStat(label: AppStrings.available, value: formatINR(group.availableBalance)),
                  const SizedBox(width: 24),
                  _BalanceStat(label: AppStrings.allocated, value: formatINR(group.allocatedBalance)),
                ]),
              ]),
            ),
            // Refresh Banner
            if (_showRefreshBanner)
              GestureDetector(
                onTap: _handleRefresh,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  color: AppColors.accent,
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Icon(LucideIcons.refreshCw, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 8),
                    Text(AppStrings.newActivityBanner, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                  ]),
                ),
              ),
            // Action Buttons
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.card,
              child: isAdmin
                ? Column(children: [
                    Row(children: [
                      Expanded(child: AppButton(label: AppStrings.addFunds, icon: const Icon(LucideIcons.plusCircle, size: 16), fullWidth: true, onPressed: () => context.push('/groups/${widget.groupId}/add-fund'))),
                      const SizedBox(width: 10),
                      // Admin can also raise fund requests
                      Expanded(child: AppButton(label: AppStrings.requestFunds, icon: const Icon(LucideIcons.fileText, size: 16), variant: AppButtonVariant.secondary, fullWidth: true, onPressed: () => context.push('/groups/${widget.groupId}/requests/raise'))),
                    ]),
                    const SizedBox(height: 10),
                    AppButton(
                      label: 'Manage Requests',
                      icon: const Icon(LucideIcons.clipboardList, size: 16),
                      variant: AppButtonVariant.secondary,
                      fullWidth: true,
                      onPressed: () => context.push('/groups/${widget.groupId}/requests/manage'),
                    ),
                  ])
                : AppButton(label: AppStrings.requestFunds, icon: const Icon(LucideIcons.fileText, size: 16), fullWidth: true, onPressed: () => context.push('/groups/${widget.groupId}/requests/raise')),
            ),
            // Tabs
            Container(
              color: AppColors.card,
              child: TabBar(
                controller: _tabCtrl,
                indicatorColor: AppColors.primary,
                labelColor: AppColors.textPrimary,
                unselectedLabelColor: AppColors.textMuted,
                labelStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                tabs: const [Tab(text: 'Transactions'), Tab(text: 'Members'), Tab(text: 'Activity')],
              ),
            ),
            Expanded(
              child: TabBarView(controller: _tabCtrl, children: [
                _TransactionsTab(groupId: widget.groupId),
                _MembersTab(groupId: widget.groupId, isAdmin: isAdmin, currentUserId: user?.id ?? ''),
                _ActivityTab(groupId: widget.groupId),
              ]),
              // isAdmin is sourced from group.myRole from the backend —
              // members can never see Add Funds / Manage Requests
            ),
          ]),
        );
      },
    );
  }
}

class _BalanceStat extends StatelessWidget {
  final String label;
  final String value;
  const _BalanceStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text(label, style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.8)),
    Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary, fontFeatures: [const FontFeature.tabularFigures()])),
  ]);
}

class _TransactionsTab extends ConsumerWidget {
  final String groupId;
  const _TransactionsTab({required this.groupId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final txAsync = ref.watch(transactionProvider(groupId));
    return txAsync.when(
      loading: () => ListView(children: List.generate(5, (_) => const SkeletonTransactionItem())),
      error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.wifiOff, color: AppColors.textMuted), const SizedBox(height: 8), Text('Failed to load transactions', style: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 13))]))),

      data: (txns) => txns.isEmpty
          ? const EmptyState(icon: LucideIcons.trendingUp, title: 'No transactions yet', subtitle: 'Add funds to get started')
          : RefreshIndicator(
              onRefresh: () => ref.refresh(transactionProvider(groupId).future),
              color: AppColors.primary,
              child: ListView.builder(
                itemCount: txns.length,
                itemBuilder: (ctx, i) => _TransactionTile(txn: txns[i]),
              ),
            ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  final TransactionModel txn;
  const _TransactionTile({required this.txn});

  @override
  Widget build(BuildContext context) {
    final isCredit = txn.isCredit;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.accent, width: 0.5))),
      child: Row(children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color: isCredit ? AppColors.success.withOpacity(0.15) : AppColors.danger.withOpacity(0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(isCredit ? LucideIcons.trendingUp : LucideIcons.trendingDown, size: 18, color: isCredit ? AppColors.success : AppColors.danger),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(txn.remarks ?? (isCredit ? 'Funds Added' : 'Transfer Completed'), style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
          Text('${txn.addedBy.name} · ${formatIST(txn.createdAt)}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
        ])),
        Text(
          '${isCredit ? '+' : '-'}${formatINR(txn.amount)}',
          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: isCredit ? AppColors.success : AppColors.danger, fontFeatures: [const FontFeature.tabularFigures()]),
        ),
      ]),
    );
  }
}

class _MembersTab extends ConsumerWidget {
  final String groupId;
  final bool isAdmin;
  final String currentUserId;
  const _MembersTab({required this.groupId, required this.isAdmin, required this.currentUserId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final membersAsync = ref.watch(membersProvider(groupId));
    return membersAsync.when(
      loading: () => ListView(children: List.generate(3, (_) => const SkeletonMemberItem())),
      error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.wifiOff, color: AppColors.textMuted), const SizedBox(height: 8), Text('Failed to load members', style: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 13))]))),

      data: (members) => Column(children: [
        if (isAdmin)
          InkWell(
            onTap: () {
              AppBottomSheet.show(context,
                title: 'Invite Member',
                content: AddMemberSheet(groupId: groupId),
              );
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(children: [
                Container(width: 40, height: 40, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.primary), color: AppColors.primary.withOpacity(0.15)),
                  child: const Icon(LucideIcons.userPlus, size: 18, color: AppColors.primaryHover)),
                const SizedBox(width: 12),
                Text('Invite New Member', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
              ]),
            ),
          ),
        Expanded(child: ListView.builder(
          itemCount: members.length,
          itemBuilder: (ctx, i) {
            final m = members[i];
            final isMe = m.user.id == currentUserId;
            return Dismissible(
              key: Key(m.id),
              direction: (isAdmin && !isMe && !m.isAdmin) ? DismissDirection.endToStart : DismissDirection.none,
              background: Container(color: AppColors.danger, alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20),
                child: const Icon(LucideIcons.userMinus, color: Colors.white)),
              confirmDismiss: (_) async {
                return await showConfirmDialog(context, title: 'Remove Member', message: 'Remove ${m.user.name} from this group?', confirmLabel: 'Remove');
              },
              onDismissed: (_) => ref.read(membersProvider(groupId).notifier).remove(m.user.id),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.accent, width: 0.5))),
                child: Row(children: [
                  AppAvatar(name: m.user.name, size: 44),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Text('${m.user.name}${isMe ? ' (you)' : ''}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(width: 8),
                      AppBadge.status(m.role),
                      if (m.isPending) ...[const SizedBox(width: 4), AppBadge.status('pending')],
                    ]),
                    Text('@${m.user.username}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
                  ])),
                ]),
              ),
            );
          },
        )),
      ]),
    );
  }
}

class _ActivityTab extends ConsumerWidget {
  final String groupId;
  const _ActivityTab({required this.groupId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final actAsync = ref.watch(activityProvider(groupId));
    return actAsync.when(
      loading: () => ListView(children: List.generate(5, (_) => const SkeletonTransactionItem())),
      error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.wifiOff, color: AppColors.textMuted), const SizedBox(height: 8), Text('Failed to load activity', style: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 13))]))),

      data: (logs) => logs.isEmpty
          ? const EmptyState(icon: LucideIcons.activity, title: 'No activity yet')
          : ListView.builder(
              itemCount: logs.length,
              itemBuilder: (ctx, i) {
                final log = logs[i];
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.accent, width: 0.5))),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Container(width: 32, height: 32, decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.secondary.withOpacity(0.25)),
                      child: const Icon(LucideIcons.activity, size: 14, color: AppColors.textSecondary)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(log.action, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textPrimary)),
                      const SizedBox(height: 4),
                      Text(formatIST(log.createdAt), style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                    ])),
                  ]),
                );
              },
            ),
    );
  }
}
