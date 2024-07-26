const { Schema, model, Types } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
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
mediaSchema.plugin(mongoosePaginate);
mediaSchema.plugin(aggregatePaginate);
const MediaModel = model("Media", mediaSchema);
module.exports=MediaModel;