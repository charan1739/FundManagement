import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/api_constants.dart';

enum SocketEvent {
  notificationNew,
  groupActivity,
  requestStatusChanged,
  balanceUpdated,
}

class SocketEventData {
  final SocketEvent event;
  final Map<String, dynamic> data;
  const SocketEventData({required this.event, required this.data});
}

class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  IO.Socket? _socket;
  final _controller = StreamController<SocketEventData>.broadcast();

  Stream<SocketEventData> get events => _controller.stream;

  bool get isConnected => _socket?.connected ?? false;

  void connect(String token, String userId) {
    if (_socket?.connected == true) return;

    _socket = IO.io(
      ApiConstants.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .setQuery({'userId': userId})
          .disableAutoConnect()
          .build(),
    );

    _socket!
      ..on('connect', (_) => debugPrint('[Socket] Connected'))
      ..on('disconnect', (_) => debugPrint('[Socket] Disconnected'))
      ..on('connect_error', (e) => debugPrint('[Socket] Error: $e'))
      ..on('notification:new', (data) => _emit(SocketEvent.notificationNew, data))
      ..on('group:activity', (data) => _emit(SocketEvent.groupActivity, data))
      ..on('request:status_changed', (data) => _emit(SocketEvent.requestStatusChanged, data))
      ..on('balance:updated', (data) => _emit(SocketEvent.balanceUpdated, data));

    _socket!.connect();
  }

  void joinGroup(String groupId) => _socket?.emit('join:group', groupId);
  void leaveGroup(String groupId) => _socket?.emit('leave:group', groupId);

  void _emit(SocketEvent event, dynamic raw) {
    final data = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    _controller.add(SocketEventData(event: event, data: data));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    _controller.close();
    disconnect();
  }
}
