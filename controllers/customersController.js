const Customer = require("../models/Customer")
const Task = require("../models/Task")

const getAllCustomers = async (req, res) => {
    const customers = await Customer.find().lean()
    if (!customers?.length) {
        return res.status(400).json({ message: "No customers found" })
    }
    res.json(customers)
}

const createNewCustomer = async (req, res) => {
    const { firstname, surname, email, phone } = req.body
    if (!firstname || !surname || !phone || !email) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const duplicate = await Customer.findOne({ firstname, surname, phone })
        .lean()
        .exec()

    if (duplicate) {
        return res.status(409).json({ message: "Duplicate customer" })
    }

    const existedPhone = await Customer.findOne({ phone }).lean().exec()

    if (existedPhone) {
        return res.status(409).json({ message: "Phone number is used" })
    }

    const existedEmail = await Customer.findOne({ email })
        .collation({ locale: "en", strength: 2 })
        .lean()
        .exec()

    if (existedEmail) {
        return res.status(409).json({ message: "Email address is used" })
    }

    const customerObj = { firstname, surname, email, phone }

    const customer = await Customer.create(customerObj)

    if (customer) {
        res.status(201).json({
            message: `New customer ${firstname} ${surname} created`,
        })
    } else {
        res.status(400).json({ message: "Invalid customer data received" })
    }
}

const updateCustomer = async (req, res) => {
    const { id, firstname, surname, email, phone, membership } = req.body

    if (!id || !firstname || !surname || !email || !phone || !membership) {
        return res.status(400).json({
            message: "All fields are required",
        })
    }

    const customer = await Customer.findById(id).exec()

    if (!customer) {
        return res.status(400).json({ message: "Customer not found" })
    }

    const duplicate = await Customer.findOne({ firstname, surname, phone })
        .lean()
        .exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate customer" })
    }

    const existedPhone = await Customer.findOne({ phone }).lean().exec()

    if (existedPhone && existedPhone?._id.toString() !== id) {
        return res.status(409).json({ message: "Phone number is used" })
    }

    const existedEmail = await Customer.findOne({ email })
        .collation({ locale: "en", strength: 2 })
        .lean()
        .exec()

    if (existedEmail && existedEmail?._id.toString() !== id) {
        return res.status(409).json({ message: "Email address is used" })
    }

    customer.firstname = firstname
    customer.surname = surname
    customer.email = email
    customer.phone = phone
    customer.membership = membership

    const updatedCustomer = await customer.save()
    const fullname = `${updatedCustomer.firstname} ${updatedCustomer.surname}`

    res.json({ message: `${fullname} updated` })
}

const deleteCustomer = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: "Customer ID required" })
    }

    const task = await Task.findOne({ customer: id }).lean().exec()

    if (task) {
        return res.status(400).json({ message: "Customer has requested tasks" })
    }

    const customer = await Customer.findById(id).exec()

    if (!customer) {
        return res.status(400).json({ message: "Customer not found" })
    }

    await customer.deleteOne().exec()

    const fullname = `${customer.firstname} ${customer.surname}`

    res.json({ message: `${fullname} with ID ${id} deleted` })
}

module.exports = {
    getAllCustomers,
    createNewCustomer,
    updateCustomer,
    deleteCustomer,
}
