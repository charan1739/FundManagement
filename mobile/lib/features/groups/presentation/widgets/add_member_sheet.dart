import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_avatar.dart';
import '../../../auth/models/user_model.dart';
import '../../../users/presentation/user_provider.dart';
import '../group_provider.dart';

class AddMemberSheet extends ConsumerStatefulWidget {
  final String groupId;
  const AddMemberSheet({super.key, required this.groupId});

  @override
  ConsumerState<AddMemberSheet> createState() => _AddMemberSheetState();
}

class _AddMemberSheetState extends ConsumerState<AddMemberSheet> {
  final _searchCtrl = TextEditingController();
  Timer? _debouncer;
  final Set<String> _selectedEmails = {};
  bool _isSending = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    _debouncer?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debouncer?.isActive ?? false) _debouncer!.cancel();
    _debouncer = Timer(const Duration(milliseconds: 500), () {
      ref.read(userSearchProvider.notifier).search(query);
    });
  }

  Future<void> _sendInvites() async {
    if (_selectedEmails.isEmpty) return;
    setState(() => _isSending = true);
    
    int successCount = 0;
    for (final email in _selectedEmails) {
      try {
        await ref.read(membersProvider(widget.groupId).notifier).invite(email);
        successCount++;
      } catch (_) {
        // Ignore individual failures to allow others to process
      }
    }
    
    if (mounted) {
      Navigator.pop(context);
      if (successCount > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sent $successCount invite(s) successfully!'), backgroundColor: AppColors.success)
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final searchAsync = ref.watch(userSearchProvider);

    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.7),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _searchCtrl,
            onChanged: _onSearchChanged,
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Search by username or email...',
              hintStyle: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted),
              prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.textMuted),
              suffixIcon: _searchCtrl.text.isNotEmpty ? IconButton(
                icon: const Icon(LucideIcons.x, size: 16, color: AppColors.textMuted),
                onPressed: () {
                  _searchCtrl.clear();
                  ref.read(userSearchProvider.notifier).clear();
                },
              ) : null,
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary)),
            ),
          ),
          const SizedBox(height: 16),
          Flexible(
            child: searchAsync.when(
              loading: () => const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
              error: (e, _) => Center(child: Text(e.toString(), style: const TextStyle(color: AppColors.danger))),
              data: (users) {
                if (_searchCtrl.text.trim().length >= 2 && users.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: AppColors.secondary.withOpacity(0.1), shape: BoxShape.circle),
                          child: const Icon(LucideIcons.userX, size: 32, color: AppColors.secondary),
                        ),
                        const SizedBox(height: 12),
                        Text('No user found', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                        Text('Try checking the spelling', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted)),
                      ],
                    ),
                  );
                }
                
                if (users.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32),
                    child: Text('Type at least 2 characters to search', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted)),
                  );
                }

                return ListView.builder(
                  shrinkWrap: true,
                  itemCount: users.length,
                  itemBuilder: (ctx, i) {
                    final u = users[i];
                    final isSelected = _selectedEmails.contains(u.email);
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: AppAvatar(name: u.name, size: 40),
                      title: Text(u.name, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      subtitle: Text('@${u.username}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
                      trailing: Checkbox(
                        value: isSelected,
                        activeColor: AppColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        onChanged: (val) {
                          setState(() {
                            if (val == true) _selectedEmails.add(u.email);
                            else _selectedEmails.remove(u.email);
                          });
                        },
                      ),
                      onTap: () {
                        setState(() {
                          if (isSelected) _selectedEmails.remove(u.email);
                          else _selectedEmails.add(u.email);
                        });
                      },
                    );
                  },
                );
              }
            ),
          ),
          const SizedBox(height: 16),
          AppButton(
            label: 'Send Invite${_selectedEmails.isNotEmpty ? ' (${_selectedEmails.length})' : ''}',
            fullWidth: true,
            loading: _isSending,
            onPressed: _selectedEmails.isEmpty ? null : _sendInvites,
          ),
        ],
      ),
    );
  }
}
