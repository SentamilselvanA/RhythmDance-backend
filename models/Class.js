const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Bharatanatyam', 'Classical', 'Western', 'Hip Hop', 'Contemporary', 'Folk'],
    required: true,
  },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  ageGroup: { type: String, required: true },
  duration: { type: String, required: true },
  fees: { type: Number, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  schedule: [{
    day: String,
    startTime: String,
    endTime: String,
  }],
  maxStudents: { type: Number, default: 20 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
