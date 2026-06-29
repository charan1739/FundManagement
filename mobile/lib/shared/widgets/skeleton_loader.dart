import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme/app_colors.dart';

class _ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final double radius;
  const _ShimmerBox({this.width = double.infinity, required this.height, this.radius = 8});
  @override
  Widget build(BuildContext context) => Container(
        width: width, height: height,
        decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(radius)),
      );
}

Widget _wrap(Widget child) => Shimmer.fromColors(
      baseColor: AppColors.accent, highlightColor: AppColors.surface, child: child);

class SkeletonGroupCard extends StatelessWidget {
  const SkeletonGroupCard({super.key});
  @override
  Widget build(BuildContext context) => _wrap(Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(children: [
          const _ShimmerBox(width: 48, height: 48, radius: 24),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            _ShimmerBox(height: 14), SizedBox(height: 8), _ShimmerBox(width: 100, height: 12),
          ])),
        ]),
      ));
}

class SkeletonTransactionItem extends StatelessWidget {
  const SkeletonTransactionItem({super.key});
  @override
  Widget build(BuildContext context) => _wrap(Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(children: [
          const _ShimmerBox(width: 40, height: 40, radius: 20),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            _ShimmerBox(height: 14), SizedBox(height: 8), _ShimmerBox(width: 120, height: 12),
          ])),
          const SizedBox(width: 12),
          const _ShimmerBox(width: 64, height: 16),
        ]),
      ));
}

class SkeletonMemberItem extends StatelessWidget {
  const SkeletonMemberItem({super.key});
  @override
  Widget build(BuildContext context) => _wrap(Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(children: [
          const _ShimmerBox(width: 44, height: 44, radius: 22),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            _ShimmerBox(height: 14), SizedBox(height: 8), _ShimmerBox(width: 80, height: 12),
          ])),
        ]),
      ));
}

class SkeletonNotifItem extends StatelessWidget {
  const SkeletonNotifItem({super.key});
  @override
  Widget build(BuildContext context) => _wrap(Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const _ShimmerBox(width: 44, height: 44, radius: 12),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            _ShimmerBox(height: 14), SizedBox(height: 8),
            _ShimmerBox(height: 12), SizedBox(height: 6),
            _ShimmerBox(width: 60, height: 10),
          ])),
        ]),
      ));
}
