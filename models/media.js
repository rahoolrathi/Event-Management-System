const { Schema, model, Types } = require("mongoose");
const mediaSchema = new Schema({
  
    file: {
      type: String,
      required: true,
    },
    fileType: { type: String, enum: ["Image", "Video"], default: "Image" },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      require: true,
    },
  },
  {
    timestamps: true,
  },
);
const MediaModel = model("Media", mediaSchema);