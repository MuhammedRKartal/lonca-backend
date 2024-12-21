import mongoose, { Schema, Document } from "mongoose";

export interface VendorType extends Document {
  name: string;
}

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
});

export default mongoose.model<VendorType>("Vendor", VendorSchema);
