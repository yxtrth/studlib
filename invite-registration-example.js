// Add this to auth routes for invite-only registration
// Requires invitation code to register

// @desc    Register with invitation code
// @route   POST /api/auth/register-invite
// @access  Public (but requires valid invitation)
router.post('/register-invite', upload.single('avatar'), [
  body('inviteCode')
    .notEmpty()
    .withMessage('Invitation code is required'),
  ...validateRegistration
], async (req, res) => {
  try {
    const { inviteCode, name, email, password, studentId, department, bio } = req.body;
    
    // Verify invitation code
    const validCodes = [
      'STUDENT2025',
      'LIBRARY_ACCESS',
      'WELCOME_STUDENT'
    ];
    
    if (!validCodes.includes(inviteCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation code'
      });
    }
    
    // Continue with normal registration...
    // (rest of registration logic)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});
