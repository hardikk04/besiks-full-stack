const mongoose = require("mongoose");

const AppSettingsSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      required: false,
    },
    heroBanners: [
      {
        image: { type: String, required: true },
        text: { type: String },
        link: { type: String },
      },
    ],

    weeklyHighlights: [
      {
        image: { type: String, required: true },
        text: { type: String },
        link: { type: String },
      },
    ],

    promoBanner: {
      image: { type: String },
      text: { type: String },
      link: { type: String },
    },

    cta: {
      text: { type: String },
      link: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppSettings", AppSettingsSchema);
