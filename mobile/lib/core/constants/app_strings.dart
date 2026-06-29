class AppStrings {
  AppStrings._();

  // App
  static const String appName = 'Fund Manager';
  static const String appTagline = 'Group-based project finances';

  // Auth
  static const String signIn = 'Sign In';
  static const String signOut = 'Log Out';
  static const String createAccount = 'Create Account';
  static const String emailLabel = 'Email';
  static const String passwordLabel = 'Password';
  static const String nameLabel = 'Full Name';
  static const String usernameLabel = 'Username';
  static const String confirmPasswordLabel = 'Confirm Password';
  static const String newPasswordLabel = 'New Password';
  static const String currentPasswordLabel = 'Current Password';
  static const String newUserPrompt = "New user? Create account";
  static const String existingUserPrompt = "Already have an account? Sign In";

  // Home
  static const String myGroups = 'MY GROUPS';
  static const String pendingInvites = 'Pending Invites';
  static const String createGroup = 'Create Group';
  static const String noGroups = 'No groups yet';
  static const String noGroupsSubtitle = 'Create a group or wait for an invite';
  static const String groupNameLabel = 'Group Name';
  static const String groupDescLabel = 'Description (optional)';
  static const String accept = 'Accept';
  static const String decline = 'Decline';

  // Group Detail
  static const String groupBalance = 'GROUP BALANCE';
  static const String available = 'Available';
  static const String allocated = 'Allocated';
  static const String addFunds = 'Add Funds';
  static const String manageRequests = 'Manage Requests';
  static const String requestFunds = 'Request Funds';
  static const String codeCopied = 'Group code copied!';
  static const String newActivityBanner = 'New activity — tap to refresh';

  // Tabs
  static const String transactionsTab = 'Transactions';
  static const String membersTab = 'Members';
  static const String activityTab = 'Activity';

  // Requests
  static const String amountLabel = 'Amount (₹)';
  static const String purposeLabel = 'Purpose';
  static const String descriptionLabel = 'Description (optional)';
  static const String requiredDateLabel = 'Required By Date (optional)';
  static const String submitRequest = 'Submit Request';
  static const String approve = 'Approve';
  static const String reject = 'Reject';
  static const String markTransferred = 'Mark as Transferred';
  static const String confirmReceipt = 'I have received the funds';
  static const String rejectionReasonLabel = 'Reason for rejection';

  // Funds
  static const String sourceLabel = 'Source (optional)';
  static const String remarksLabel = 'Remarks (optional)';
  static const String transactionDateLabel = 'Transaction Date';
  static const String addFundsButton = 'Add Funds';

  // Notifications
  static const String notificationsTitle = 'Notifications';
  static const String markAllRead = 'Mark all read';
  static const String allCaughtUp = "You're all caught up";
  static const String noNotifs = 'No notifications right now.';

  // Profile
  static const String profileTitle = 'Profile';
  static const String myRequests = 'My Requests';
  static const String changePassword = 'Change Password';
  static const String editProfile = 'Edit Profile';
  static const String saveChanges = 'Save Changes';
  static const String deleteAccount = 'Delete Account';
  static const String phoneLabel = 'Phone (optional)';
  static const String typeDeleteConfirm = 'Type DELETE to confirm';

  // Errors
  static const String networkError = 'No internet connection';
  static const String serverError = 'Something went wrong. Please try again.';
  static const String unknownError = 'An unexpected error occurred';

  // File upload
  static const String attachDocument = 'Attach supporting document';
  static const String attachProof = 'Attach proof (screenshot, bank transfer, receipt)';
  static const String attachReceipt = 'Attach receipt (optional)';
  static const String fileTooLarge = 'File too large — max 5 MB';
  static const String fileTypeError = 'Only JPG, PNG, and PDF files are supported';
}
