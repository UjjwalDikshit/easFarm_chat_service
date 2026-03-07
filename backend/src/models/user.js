const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    user_id:{
      type:String,
      unique:true,
      required:true,
      index:true
    },
    lastSeen: {
      type: Date,
    },

    // Optional profile fields
    name: String,
    avatar: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// module.exports = mongoose.model("ChatUser", userSchema);
module.exports = mongoose.models.ChatUser || mongoose.model('ChatUser', userSchema);