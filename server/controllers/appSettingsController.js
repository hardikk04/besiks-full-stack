const { success } = require("zod");
const AppSettings = require("../models/AppSettings");

// Get App Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res
        .status(404)
        .json({ success: false, message: "Settings not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Settings Fetched Successfully",
        data: settings,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create or Initialize Settings (Only Once)
exports.createSettings = async (req, res) => {
  try {
    let settings = await AppSettings.findOne();
    if (settings)
      return res
        .status(400)
        .json({ success: false, message: "Settings already exist" });

    settings = new AppSettings(req.body);
    await settings.save();
    res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// helper to get or create settings doc
async function getOrCreateSettings(initial = {}) {
  let settings = await AppSettings.findOne();
  if (!settings) {
    settings = new AppSettings({
      logo: initial.logo || "",
      heroBanners: initial.heroBanners || [],
      weeklyHighlights: initial.weeklyHighlights || [],
      promoBanner: initial.promoBanner || { image: "", text: "", link: "" },
      cta: initial.cta || { text: "", link: "" },
    });
    await settings.save();
  }
  return settings;
}

// Update Logo
exports.updateLogo = async (req, res) => {
  try {
    const settings = await getOrCreateSettings({ logo: req.body.logo || "" });
    settings.logo = req.body.logo;
    await settings.save();
    res.status(200).json({
      success: true,
      message: "Logo Updated Successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Hero Banners
exports.updateHeroBanners = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    if (req.body.heroBanners.length > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum 5 hero banners allowed" });
    }

    settings.heroBanners = req.body.heroBanners;
    await settings.save();
    res.status(200).json({
      success: true,
      message: "Hero Banners Updated Successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Weekly Highlights
exports.updateWeeklyHighlights = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.weeklyHighlights = req.body.weeklyHighlights;
    await settings.save();
    res.status(200).json({
      success: true,
      message: "Weekly Highlights Updated Successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Promo Banner
exports.updatePromoBanner = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.promoBanner = req.body.promoBanner;
    await settings.save();
    res.status(200).json({
      success: true,
      message: "Promo Banner Updated Successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update CTA
exports.updateCTA = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.cta = req.body.cta;
    await settings.save();
    res.status(200).json({
      success: true,
      message: "CTA Updated Successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
