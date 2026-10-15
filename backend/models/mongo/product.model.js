import mongoose from 'mongoose';

export const productSchema= new mongoose.Schema({
  name : {
    type: String,
    required: true
  },
  description :{
    type: String,
  },
  price :{
    type: Number,
    min: 0,
    required: true
  },
  stock : {
    type: Number,
    min: 1,
    required: true
  },
  category : {
    type: String,
    required: true
  },
  brand : {
    type: String,
  },
  images : {
    type: [String]
  },
  isActive : {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

export const Product= mongoose.model('Product', productSchema);