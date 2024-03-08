const Task = require("../models/Task")
const User = require("../models/User")
const Customer = require("../models/Customer")

const getAllTasks = async (req, res) => {
    const tasks = await Task.find().lean()
    if (!tasks?.length) {
        return res.status(400).json({ message: "No tasks found" })
    }
    const tasksWithUser = await Promise.all(
        tasks.map(async (task) => {
            const user = await User.findById(task.user).lean().exec()
            return { ...task, username: user.username }
        })
    )

    res.json(tasksWithUser)
}

const createNewTask = async (req, res) => {
    const { user, customer, title, description } = req.body

    if (!user || !customer || !title || !description) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const existedUser = await User.findById(user).lean().exec()

    if (!existedUser) {
        return res.status(400).json({ message: "User not found" })
    }

    const existedCustomer = await Customer.findById(customer).lean().exec()

    if (!existedCustomer) {
        return res.status(400).json({ message: "Customer not found" })
    }

    const taskObj = { user, customer, title, description, completed: false }

    const task = await Task.create(taskObj)

    if (task) {
        res.status(201).json({ message: `Task #${task.order} created` })
    } else {
        res.status(400).json({ message: "Invalid task data received" })
    }
}

const updateTask = async (req, res) => {
    const { id, user, customer, title, description, completed } = req.body

    if (
        !id ||
        !user ||
        !customer ||
        !title ||
        !description ||
        typeof completed !== "boolean"
    ) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const task = await Task.findById(id).exec()

    if (!task) {
        return res.status(400).json({ message: "Task not found" })
    }

    task.user = user
    task.customer = customer
    task.title = title
    task.description = description
    task.completed = completed

    const updatedTask = await task.save()

    res.json({ message: `Ticket #${updatedTask.order} updated` })
}

const deleteTask = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: "Task ID required" })
    }

    const task = await Task.findById(id).exec()

    if (!task) {
        return res.status(400).json({ message: "Task not found" })
    }

    const order = task.order

    await task.deleteOne().exec()

    res.json({ message: `Task #${order} deleted` })
}

module.exports = {
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask,
}
