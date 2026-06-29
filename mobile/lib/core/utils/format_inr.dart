import 'package:intl/intl.dart';

String formatINR(num amount) {
  final formatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );
  return formatter.format(amount);
}

String formatINRCompact(num amount) {
  if (amount >= 10000000) return '₹${(amount / 10000000).toStringAsFixed(1)}Cr';
  if (amount >= 100000) return '₹${(amount / 100000).toStringAsFixed(1)}L';
  if (amount >= 1000) return '₹${(amount / 1000).toStringAsFixed(1)}K';
  return formatINR(amount);
}
