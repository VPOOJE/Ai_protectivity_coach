import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  sleepHours: {
    type: Number,
    required: true,
  },
  exerciseFrequency: {
    type: String,
    required: true,
  },
  stressLevel: {
    type: Number,
    required: true,
  },
  wellnessGoals: [{
    type: String,
  }],
  energyLevel: {
    type: Number,
    required: true,
  },
  additionalInfo: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export default mongoose.model("UserProfile", userProfileSchema);
