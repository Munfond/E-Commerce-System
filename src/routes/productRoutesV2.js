const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeSeller } = require('../middlewares/authMiddleware');
const productControllerV2 = require('../controllers/productControllerV2');
const productImagesControllerV2 = require('../controllers/productImagesControllerV2');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get("/shops/:shopId", productControllerV2.getShopProducts);
router.get("/me", authenticateToken, authorizeSeller, productControllerV2.getMyShopProducts);
router.get("/:id", productControllerV2.getDetail);

router.use(authenticateToken);
router.patch("/me/variants/:variant_id/stock", authorizeSeller, productControllerV2.updateStock);
router.put("/me/variants/:variant_id", authorizeSeller, upload.single('image'), productControllerV2.updateVariant);
router.delete("/me/variants/:variant_id", authorizeSeller, productControllerV2.deleteVariant);

router.post("/me/:id/images", authorizeSeller, upload.single('image'), productImagesControllerV2.addImage);
router.delete("/me/images/:image_id", authorizeSeller, productImagesControllerV2.deleteImage);
router.put("/me/:id/images/reorder", authorizeSeller, productImagesControllerV2.reorderImages);

router.post("/me/:id/variants", authorizeSeller, upload.array('variant_files', 20), productControllerV2.addVariants);
router.patch("/me/:id", authorizeSeller, productControllerV2.updateProduct);
//router.patch("/me/:id", authorizeSeller, productControllerV2.update);
//router.post("/me", authorizeSeller, productControllerV2.create);
router.post("/me", authorizeSeller, upload.fields([
    { name: 'variant_files', maxCount: 20 },
    { name: 'product_images', maxCount: 20 }
]), productControllerV2.create);

router.put("/me/:id/sync", authorizeSeller, upload.fields([
    { name: 'variant_files', maxCount: 20 },
    { name: 'product_images', maxCount: 20 }
]), productControllerV2.update);

module.exports = router;
