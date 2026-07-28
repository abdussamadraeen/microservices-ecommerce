import mongoose, { InferSchemaType, model } from "mongoose";
const { Schema } = mongoose;

export const OrderStatus = ["success", "failed", "pending", "processing", "shipped", "delivered"] as const;

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true },
    email: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: OrderStatus },
    paymentId: { type: String },
    paymentMethod: { type: String },
    shippingAddress: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
    },
    products: {
      type: [
        {
          id: { type: Number },
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true },
          image: { type: String },
          selectedSize: { type: String },
          selectedColor: { type: String },
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export type OrderSchemaType = InferSchemaType<typeof OrderSchema>;

export const Order = (mongoose.models.Order as mongoose.Model<OrderSchemaType>) || model<OrderSchemaType>("Order", OrderSchema);
