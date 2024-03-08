const express = require("express")
const customersContrller = require("../controllers/customersController")
const verifyJWT = require("../middleware/verifyJWT")

const router = express.Router()

router.use(verifyJWT)

router
    .route("/")
    .get(customersContrller.getAllCustomers)
    .post(customersContrller.createNewCustomer)
    .patch(customersContrller.updateCustomer)
    .delete(customersContrller.deleteCustomer)

module.exports = router
