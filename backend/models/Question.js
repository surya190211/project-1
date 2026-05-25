import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  url: {
    type: String,
    default: ""
  },
  tags: [{
    type: String,
    trim: true
  }],
  num: {
    type: Number,
    default: null
  },
  slug: {
    type: String,
    default: ""
  },
  cc: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', QuestionSchema);
export default Question;
