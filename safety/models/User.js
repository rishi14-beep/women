const mongoose = require('mongoose');

// User schema stores basic profile and emergency contacts
const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true }, // primary mobile number
    fatherName: { type: String, required: true, trim: true },
    fatherPhone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    emergencyContacts: [emergencyContactSchema], // optional extra contacts
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
