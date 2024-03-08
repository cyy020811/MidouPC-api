const Product = require("../models/Product")

const getAllProducts = async (req, res) => {
    const products = await Product.find().lean()
    if (!products?.length) {
        return res.status(400).json({ message: "No products found" })
    }
    res.json(products)
}

const createNewProduct = async (req, res) => {
    const { name, brand, price, stock } = req.body
    if (!name || !brand) {
        return res
            .status(400)
            .json({ message: "Product name and brand are required" })
    }

    const duplicate = await Product.findOne({ name }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: "Duplicate product" })
    }

    const parsedPrice =
        !isNaN(parseFloat(price)) && isFinite(price)
            ? parseFloat(price)
            : undefined

    const parsedStock =
        !isNaN(parseFloat(stock)) && isFinite(stock)
            ? parseFloat(stock)
            : undefined

    const productObj = { name, brand, price: parsedPrice, stock: parsedStock }
    const product = await Product.create(productObj)

    if (product) {
        res.status(201).json({ message: `New product ${name} created` })
    } else {
        res.status(400).json({ message: "Invalid product data received" })
    }
}

const updateProduct = async (req, res) => {
    const { id, name, brand, price, stock } = req.body
    if (!id || !name || !brand) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const updatedPrice =
        !isNaN(parseFloat(price)) && isFinite(price)
            ? parseFloat(price)
            : undefined

    const updatedStock =
        !isNaN(parseFloat(stock)) && isFinite(stock)
            ? parseFloat(stock)
            : undefined

    const product = await Product.findById(id).exec()

    if (!product) {
        return res.status(400).json({ message: "Product not found" })
    }

    const duplicate = await Product.findOne({ name }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate product" })
    }

    product.name = name
    product.brand = brand

    if (!isNaN(parseFloat(price)) && isFinite(price)) {
        product.price = price
    } else if (price) {
        return res.status(400).json({ message: "Price data is not a number" })
    }

    if (!isNaN(parseFloat(stock)) && isFinite(stock)) {
        product.stock = stock
    } else if (stock) {
        return res.status(400).json({ message: "Stock data is not a number" })
    }

    const updatedProduct = await product.save()

    res.json({ message: `${updatedProduct.name} updated` })
}

const deleteProduct = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: "Product ID required" })
    }

    const product = await Product.findById(id).exec()

    if (!product) {
        return res.status(400).json({ message: "Product not found" })
    }

    await product.deleteOne().exec()

    res.json({ message: `${product.name} with ID ${id} deleted` })
}

module.exports = {
    getAllProducts,
    createNewProduct,
    updateProduct,
    deleteProduct,
}
