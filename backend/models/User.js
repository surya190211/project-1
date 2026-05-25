import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  notif: {
    type: Boolean,
    default: true
  },
  streak: {
    cur: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    last: { type: String, default: null } // Stored as a date string 'YYYY-MM-DD'
  },
  leetcodeUsername: {
    type: String,
    default: ""
  },
  codechefUsername: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
export default User;
