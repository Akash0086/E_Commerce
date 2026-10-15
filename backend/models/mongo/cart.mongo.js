import mongoose from 'mongoose';

export const cartSchema= new mongoose.Schema({
  userId:{
    type: Number,
    required: true
  },
  items:[{  
    productId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity:{
      type:Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    }
  }]
},{
  timestamps: true
});

export const Cart= mongoose.model('Cart',cartSchema);