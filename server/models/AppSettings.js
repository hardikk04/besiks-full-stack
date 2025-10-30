const mongoose = require("mongoose");

const NavItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    href: { type: String },
    children: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { _id: false }
);

NavItemSchema.add({ children: [NavItemSchema] });

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

  // Deprecated: use navMenu instead
  megaMenu: [
    {
      title: { type: String, required: true },
      items: [
        {
          name: { type: String, required: true },
          href: { type: String, required: true },
        },
      ],
    },
  ],

  // New: full navbar configuration with nested items
  navMenu: [NavItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppSettings", AppSettingsSchema);
