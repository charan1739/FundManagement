import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../features/requests/models/fund_request_model.dart';
import '../../core/utils/format_ist.dart';

class StatusTimeline extends StatelessWidget {
  final FundRequestModel request;

  const StatusTimeline({super.key, required this.request});

  static const _stages = ['Submitted', 'Approved', 'Transferred', 'Received'];
  static const _statusOrder = {
    'pending': 0, 'approved': 1, 'rejected': 1,
    'transferred': 2, 'received': 3, 'completed': 3,
  };

  @override
  Widget build(BuildContext context) {
    final currentIdx = _statusOrder[request.status] ?? 0;
    final isRejected = request.status == 'rejected';

    final timestamps = [
      request.createdAt,
      request.approvedAt,
      request.transferredAt,
      request.completedAt,
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(_stages.length, (i) {
          final done = i < currentIdx || (i == currentIdx && !isRejected);
          final isRejectedStage = isRejected && i == 1;
          final isLast = i == _stages.length - 1;

          return Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Row(children: [
                        _Dot(done: done, rejected: isRejectedStage),
                        if (!isLast)
                          Expanded(child: Container(height: 2, color: done && !isRejectedStage ? AppColors.primary : AppColors.accent)),
                      ]),
                      const SizedBox(height: 6),
                      Text(
                        isRejectedStage ? 'Rejected' : _stages[i],
                        style: GoogleFonts.inter(
                          fontSize: 9, fontWeight: FontWeight.w600,
                          color: isRejectedStage ? AppColors.danger : done ? AppColors.primaryHover : AppColors.textMuted,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (timestamps[i] != null && done) ...[
                        const SizedBox(height: 3),
                        Text(
                          formatISTDate(timestamps[i]),
                          style: GoogleFonts.inter(fontSize: 8, color: AppColors.textMuted),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final bool done;
  final bool rejected;
  const _Dot({required this.done, required this.rejected});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 12, height: 12,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: rejected ? AppColors.danger : done ? AppColors.primary : Colors.transparent,
        border: Border.all(
          color: rejected ? AppColors.danger : done ? AppColors.primary : AppColors.accent,
          width: 2,
        ),
      ),
    );
  }
}
