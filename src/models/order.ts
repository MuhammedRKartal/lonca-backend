import mongoose, { Schema, Document } from "mongoose";

export interface CartItemType {
  product: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;
  series: string;
  item_count: number;
  quantity: number;
  cogs: number;
  price: number;
  vendor_margin: number;
  order_status: string;
}

export interface OrderType extends Document {
  cart_item: CartItemType[];
  payment_at: Date;
}

const CartItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Parent_Product",
    required: true,
  },
  variantId: { type: Schema.Types.ObjectId, required: true },
  series: { type: String, required: true },
  item_count: { type: Number, required: true },
  quantity: { type: Number, required: true },
  cogs: { type: Number, required: true },
  price: { type: Number, required: true },
  vendor_margin: { type: Number, required: true },
  order_status: { type: String, required: true },
});

const OrderSchema: Schema = new Schema({
  cart_item: { type: [CartItemSchema], required: true },
  payment_at: { type: Date, required: true },
});

export default mongoose.model<OrderType>("Order", OrderSchema);
