const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  weeklyDonation: {
    type: Number,
    default: 0,
  },
});

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
