const mongoose = require("mongoose");
const { isLowercase } = require("validator");

const deliveryFeeSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    unique: true,
    enum: [
      "Dubai",
      "Sharjah",
      "Ajman",
      "Abu Dhabi",
      "Umm Al Qaiwain",
      "Fujairah",
      "Ras Al Khaimah",
    ],
  },
  fee: { type: Number, required: [true, "There has to be a shipping price."] },
});

module.exports = mongoose.model("DeliveryFee", deliveryFeeSchema);
