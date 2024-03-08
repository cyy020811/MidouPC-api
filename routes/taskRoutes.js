const express = require("express")
const tasksController = require("../controllers/tasksController")
const verifyJWT = require("../middleware/verifyJWT")

const router = express.Router()

router.use(verifyJWT)

router
    .route("/")
    .get(tasksController.getAllTasks)
    .post(tasksController.createNewTask)
    .patch(tasksController.updateTask)
    .delete(tasksController.deleteTask)

module.exports = router
