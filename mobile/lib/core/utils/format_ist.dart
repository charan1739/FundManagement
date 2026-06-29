import 'package:intl/intl.dart';

final _istOffset = const Duration(hours: 5, minutes: 30);

DateTime _toIST(String isoString) {
  final utc = DateTime.parse(isoString).toUtc();
  return utc.add(_istOffset);
}

/// "28 Jun 2026, 3:45 PM"
String formatIST(String? isoString) {
  if (isoString == null || isoString.isEmpty) return '—';
  final dt = _toIST(isoString);
  return DateFormat('dd MMM yyyy, h:mm a').format(dt);
}

/// "28 Jun 2026"
String formatISTDate(String? isoString) {
  if (isoString == null || isoString.isEmpty) return '—';
  final dt = _toIST(isoString);
  return DateFormat('dd MMM yyyy').format(dt);
}

/// Relative: "just now", "2m ago", "1h ago", "3d ago", or date
String formatRelative(String? isoString) {
  if (isoString == null || isoString.isEmpty) return '';
  final dt = DateTime.parse(isoString).toUtc();
  final now = DateTime.now().toUtc();
  final diff = now.difference(dt);
  if (diff.inMinutes < 1) return 'just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  if (diff.inDays == 1) return 'Yesterday';
  if (diff.inDays < 7) return '${diff.inDays}d ago';
  return formatISTDate(isoString);
}

/// Group label for notification sections
String dateGroupLabel(String? isoString) {
  if (isoString == null) return 'Earlier';
  final dt = DateTime.parse(isoString).toUtc().add(_istOffset);
  final now = DateTime.now().toUtc().add(_istOffset);
  final today = DateTime(now.year, now.month, now.day);
  final yesterday = today.subtract(const Duration(days: 1));
  final target = DateTime(dt.year, dt.month, dt.day);
  if (target == today) return 'Today';
  if (target == yesterday) return 'Yesterday';
  return 'Earlier';
}
