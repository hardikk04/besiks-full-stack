const express = require("express");
const router = express.Router();
const controller = require("../controllers/appSettingsController");

router.get("/", controller.getSettings);
router.post("/", controller.createSettings);

router.put("/logo", controller.updateLogo);
router.put("/hero-banners", controller.updateHeroBanners);
router.put("/weekly-highlights", controller.updateWeeklyHighlights);
router.put("/promo-banner", controller.updatePromoBanner);
router.put("/cta", controller.updateCTA);

module.exports = router;
