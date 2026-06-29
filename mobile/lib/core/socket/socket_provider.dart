import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/socket/socket_service.dart';

final socketProvider = Provider<SocketService>((ref) => SocketService.instance);

final socketEventProvider = StreamProvider<SocketEventData>(
  (ref) => SocketService.instance.events,
);
