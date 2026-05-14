const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeSeller } = require('../middlewares/authMiddleware');
const productControllerV2 = require('../controllers/productControllerV2');

router.get("/:id", productControllerV2.getDetail);
router.get("/shops/:shopId", productControllerV2.getShopProducts); 

router.use(authenticateToken);

router.put("/me/:id/variants/:variant_id/stock", authorizeSeller, productControllerV2.updateStock);
router.put("/me/:id/variants/:variant_id", authorizeSeller, productControllerV2.updateVariants);
router.delete("/me/:id/variants/:variant_id", authorizeSeller, productControllerV2.deleteVariant);

router.delete("/me/:id/images/:image_id", authorizeSeller, productControllerV2.deleteImage);
router.post("/me/:id/images", authorizeSeller, productControllerV2.addImages);

router.post("/me/:id/variants", authorizeSeller, productControllerV2.addVariants);
router.put("/me/:id", authorizeSeller, productControllerV2.updateProduct);
//router.patch("/me/:id", authorizeSeller, productControllerV2.update);
router.post("/me", authorizeSeller, productControllerV2.create);

module.exports = router;

/* JSON cho products:
Create Products
{
    "productData": {
        "name": "Áo thun nam",
        "description": "Áo thun nam chất liệu cotton, thoáng mát, phù hợp cho mùa hè.",
        "category_id": 1,
        "brand": "Thời Trang Nam",
    },
    "variants": [
        {
            "name": "Size M - Đỏ",
            "sku": "ATM-RED-M",
            "price": 250000,
            "stock": 100,
            "image_url": "https://example.com/images/ao-thun-nam-1.jpg"
        },
        {
            "name": "Size L - Đỏ",
            "sku": "ATL-RED-L",
            "price": 250000,
            "stock": 80,
            "image_url": "https://example.com/images/ao-thun-nam-1.jpg"
        },
        {
            "name": "Size M - Xanh",
            "sku": "ATM-BLUE-M",
            "price": 250000,
            "stock": 120,
            "image_url": "https://example.com/images/ao-thun-nam-3.jpg"
        }
    ],
    "images": [
        {
            "image_url": "https://example.com/images/ao-thun-nam-1.jpg",
            "display_order": 0
        },
        {
            "image_url": "https://example.com/images/ao-thun-nam-2.jpg",
            "display_order": 1
        }
    ]
}       
 */