import mongoose, { Schema, Document } from "mongoose";

export interface ParentProductType extends Document {
  name: string;
  vendor: mongoose.Types.ObjectId;
}

const ParentProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
});

export default mongoose.model<ParentProductType>(
  "Parent_Product",
  ParentProductSchema
);
