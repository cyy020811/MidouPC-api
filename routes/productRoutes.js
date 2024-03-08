const express = require("express")
const productsController = require("../controllers/productsController")
const verifyJWT = require("../middleware/verifyJWT")

const router = express.Router()

router.use(verifyJWT)

router
    .route("/")
    .get(productsController.getAllProducts)
    .post(productsController.createNewProduct)
    .patch(productsController.updateProduct)
    .delete(productsController.deleteProduct)

module.exports = router
