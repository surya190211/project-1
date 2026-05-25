import mongoose from 'mongoose';

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Solved'],
    default: 'Todo'
  },
  notes: {
    type: String,
    default: ""
  },
  lcSynced: {
    type: Boolean,
    default: false
  },
  ccSynced: {
    type: Boolean,
    default: false
  },
  dateCompleted: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// A user should only have one progress record per question
UserProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
export default UserProgress;
