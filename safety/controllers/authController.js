const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
function generateToken(user) {
  const payload = {
    userId: user._id,
    phone: user.phone,
    name: user.name,
  };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, phone, fatherName, fatherPhone, password } = req.body;

    // Basic validation of required fields
    if (!name || !phone || !fatherName || !fatherPhone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check for duplicate registration by phone number
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this mobile number already exists' });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      phone,
      fatherName,
      fatherPhone,
      passwordHash,
    });

    await user.save();

    return res.status(201).json({ message: 'Registration successful. Please login.' });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        fatherName: user.fatherName,
        fatherPhone: user.fatherPhone,
        emergencyContacts: user.emergencyContacts || [],
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me - returns current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err.message);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// POST /api/auth/contacts - add extra emergency contact (optional feature)
exports.addContact = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Contact name and phone are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.emergencyContacts.push({ name, phone });
    await user.save();

    return res.status(201).json({ message: 'Contact added', contacts: user.emergencyContacts });
  } catch (err) {
    console.error('Add contact error:', err.message);
    return res.status(500).json({ message: 'Server error adding contact' });
  }
};
