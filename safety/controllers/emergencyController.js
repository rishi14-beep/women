const twilio = require('twilio');
const User = require('../models/User');

// Initialize Twilio client using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
let twilioClient = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

// POST /api/emergency/trigger
// Expects: { latitude, longitude, mapsLink }
exports.triggerEmergency = async (req, res) => {
  try {
    if (!twilioClient) {
      return res.status(500).json({ message: 'Twilio is not configured on the server' });
    }

    const { latitude, longitude, mapsLink } = req.body;
    if (!latitude || !longitude || !mapsLink) {
      return res.status(400).json({ message: 'Location data is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) {
      return res.status(500).json({ message: 'Twilio phone number not configured' });
    }

    const baseMessage = `EMERGENCY ALERT!\nYour daughter ${user.name} may be in danger.\nLocation: ${mapsLink}\nPlease contact immediately.`;

    const recipients = [user.fatherPhone, ...(user.emergencyContacts || []).map((c) => c.phone)];

    const smsPromises = recipients.map((to) => {
      // Skip invalid/empty numbers defensively
      if (!to) return null;
      return twilioClient.messages.create({
        body: baseMessage,
        from: fromNumber,
        to,
      });
    });

    await Promise.all(smsPromises.filter(Boolean));

    return res.json({ message: 'Emergency SMS sent to contacts' });
  } catch (err) {
    console.error('Emergency trigger error:', err.message);
    return res.status(500).json({ message: 'Server error sending emergency alerts' });
  }
};
