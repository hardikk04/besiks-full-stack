const express = require("express");
const router = express.Router();
const controller = require("../controllers/appSettingsController");
const { admin, protect } = require("../middleware/auth");

router.get("/", controller.getSettings);
router.post("/", protect, admin, controller.createSettings);

router.put("/logo", protect, admin, controller.updateLogo);
router.put("/favicon", protect, admin, controller.updateFavicon);
router.put("/hero-banners", protect, admin, controller.updateHeroBanners);
router.put(
  "/weekly-highlights",
  protect,
  admin,
  controller.updateWeeklyHighlights
);
router.put("/promo-banner", protect, admin, controller.updatePromoBanner);
router.put("/cta", protect, admin, controller.updateCTA);
router.put("/mega-menu", protect, admin, controller.updateMegaMenu);
router.put("/nav-menu", protect, admin, controller.updateNavMenu);

module.exports = router;
