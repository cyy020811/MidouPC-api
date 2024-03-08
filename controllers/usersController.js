const bcrypt = require("bcrypt")
const User = require("../models/User")
const Task = require("../models/Task")

const getAllUsers = async (req, res) => {
    const users = await User.find().select("-password").lean()
    if (!users?.length) {
        return res.status(400).json({ message: "No users found" })
    }
    res.json(users)
}

const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const duplicate = await User.findOne({ username })
        .collation({ locale: "en", strength: 2 })
        .lean()
        .exec()

    if (duplicate) {
        return res.status(409).json({ message: "Duplicate user" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userObj =
        !Array.isArray(roles) || !roles.length
            ? { username, password: hashedPassword }
            : { username, password: hashedPassword, roles }
    const user = await User.create(userObj)

    if (user) {
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: "Invalid user data received" })
    }
}

const updateUser = async (req, res) => {
    const { id, username, roles, active, password } = req.body

    if (
        !id ||
        !username ||
        !Array.isArray(roles) ||
        !roles.length ||
        typeof active !== "boolean"
    ) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    const duplicate = await User.findOne({ username })
        .collation({ locale: "en", strength: 2 })
        .lean()
        .exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate username" })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
}

const deleteUser = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: "User ID required" })
    }

    const task = await Task.findOne({ user: id }).lean().exec()

    if (task) {
        return res.status(400).json({ message: "User has assigned tasks" })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    await user.deleteOne().exec()

    res.json({ message: `${user.username} with ID ${id} deleted` })
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
}
