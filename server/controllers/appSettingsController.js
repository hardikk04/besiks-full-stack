const AppSettings = require("../models/AppSettings");
const { deleteImageFile, deleteImageFiles, findDeletedImages } = require("../utils/imageCleanup");

// Get App Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    if (!settings)
      return res
        .status(404)
        .json({ success: false, message: "Settings not found" });
    // Backwards compatibility: if navMenu missing but megaMenu exists, expose a mapped navMenu
    const data = settings.toObject();
    if ((!data.navMenu || data.navMenu.length === 0) && Array.isArray(data.megaMenu) && data.megaMenu.length > 0) {
      data.navMenu = data.megaMenu.map((cat) => ({
        label: cat.title,
        href: undefined,
        children: (cat.items || []).map((i) => ({ label: i.name, href: i.href, children: [] })),
      }));
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Settings Fetched Successfully",
        data,
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
      favicon: initial.favicon || "",
      heroBanners: initial.heroBanners || [],
      weeklyHighlights: initial.weeklyHighlights || [],
      promoBanner: initial.promoBanner || { image: "", text: "", link: "" },
      cta: initial.cta || { text: "", link: "" },
      megaMenu: initial.megaMenu || [],
      navMenu: initial.navMenu || [],
    });
    await settings.save();
  }
  return settings;
}

// Update Logo
exports.updateLogo = async (req, res) => {
  try {
    const settings = await getOrCreateSettings({ logo: req.body.logo || "" });
    const oldLogo = settings.logo;
    settings.logo = req.body.logo;
    await settings.save();
    
    // Delete old logo if it's being replaced or removed
    if (oldLogo && (!req.body.logo || oldLogo !== req.body.logo)) {
      await deleteImageFile(oldLogo);
    }
    
    res.status(200).json({
      success: true,
      message: "Logo Updated Successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Favicon
exports.updateFavicon = async (req, res) => {
  try {
    const settings = await getOrCreateSettings({ favicon: req.body.favicon || "" });
    const oldFavicon = settings.favicon;
    settings.favicon = req.body.favicon;
    await settings.save();
    
    // Delete old favicon if it's being replaced or removed
    if (oldFavicon && (!req.body.favicon || oldFavicon !== req.body.favicon)) {
      await deleteImageFile(oldFavicon);
    }
    
    res.status(200).json({
      success: true,
      message: "Favicon Updated Successfully",
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

    // Store old banner images before update
    const oldBannerImages = (settings.heroBanners || []).map(banner => banner.image);
    const newBannerImages = (req.body.heroBanners || []).map(banner => banner.image);

    settings.heroBanners = req.body.heroBanners;
    await settings.save();
    
    // Delete old banner images that are no longer in the new array
    const imagesToDelete = findDeletedImages(oldBannerImages, newBannerImages);
    if (imagesToDelete.length > 0) {
      await deleteImageFiles(imagesToDelete);
    }
    
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
    
    // Store old highlight images before update
    const oldHighlightImages = (settings.weeklyHighlights || []).map(highlight => highlight.image);
    const newHighlightImages = (req.body.weeklyHighlights || []).map(highlight => highlight.image);
    
    settings.weeklyHighlights = req.body.weeklyHighlights;
    await settings.save();
    
    // Delete old highlight images that are no longer in the new array
    const imagesToDelete = findDeletedImages(oldHighlightImages, newHighlightImages);
    if (imagesToDelete.length > 0) {
      await deleteImageFiles(imagesToDelete);
    }
    
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
    const oldPromoImage = settings.promoBanner?.image;
    settings.promoBanner = req.body.promoBanner;
    await settings.save();
    
    // Delete old promo banner image if it's being replaced or removed
    if (oldPromoImage && (!req.body.promoBanner?.image || oldPromoImage !== req.body.promoBanner.image)) {
      await deleteImageFile(oldPromoImage);
    }
    
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

// Update Mega Menu
exports.updateMegaMenu = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.megaMenu = req.body.megaMenu || [];
    await settings.save();
    res.status(200).json({
      success: true,
      message: "Mega menu updated successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Nav Menu (new full navbar structure)
exports.updateNavMenu = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const navMenu = Array.isArray(req.body.navMenu) ? req.body.navMenu : [];
    settings.navMenu = navMenu;
    await settings.save();
    res.status(200).json({
      success: true,
      message: "Nav menu updated successfully",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
