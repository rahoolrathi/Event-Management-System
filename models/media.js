const { Schema, model, Types } = require("mongoose");
const mediaSchema = new Schema({
  
    file: {
      type: String,
      required: true,
    },
    fileType: { type: String, enum: ["Image", "Video"], default: "Image" },
    userId: {
      type: Types.ObjectId,
      ref: "users",
      require: true,
    },
  },
  {
    timestamps: true,
  },
);
const MediaModel = model("Media", mediaSchema);
module.exports=MediaModel;