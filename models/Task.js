const mongoose = require("mongoose")
const AutoIncrement = require("mongoose-sequence")(mongoose)

const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Customer",
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

taskSchema.plugin(AutoIncrement, {
    inc_field: "order",
    id: "orderNums",
    start_seq: 1000,
})

module.exports = mongoose.model("Task", taskSchema)
