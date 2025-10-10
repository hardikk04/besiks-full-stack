const AppSettings = require("../models/AppSettings");

// Get App Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res.status(404).json({ message: "Settings not found" });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create or Initialize Settings (Only Once)
exports.createSettings = async (req, res) => {
  try {
    let settings = await AppSettings.findOne();
    if (settings)
      return res.status(400).json({ message: "Settings already exist" });

    settings = new AppSettings(req.body);
    await settings.save();
    res.status(201).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Logo
exports.updateLogo = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res.status(404).json({ message: "Settings not found" });

    settings.logo = req.body.logo;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Hero Banners
exports.updateHeroBanners = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res.status(404).json({ message: "Settings not found" });

    if (req.body.heroBanners.length > 5) {
      return res
        .status(400)
        .json({ message: "Maximum 5 hero banners allowed" });
    }

    settings.heroBanners = req.body.heroBanners;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Weekly Highlights
exports.updateWeeklyHighlights = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res.status(404).json({ message: "Settings not found" });

    settings.weeklyHighlights = req.body.weeklyHighlights;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Promo Banner
exports.updatePromoBanner = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res.status(404).json({ message: "Settings not found" });

    settings.promoBanner = req.body.promoBanner;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update CTA
exports.updateCTA = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res.status(404).json({ message: "Settings not found" });

    settings.cta = req.body.cta;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
