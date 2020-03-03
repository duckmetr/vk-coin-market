const {Schema, model} = require('mongoose')

const orderSchema = new Schema({
	// _id: Schema.Types.ObjectId,
	status: {
		type: String,
		default: 'Ожидание оплаты'
	},
	vk: {
		from: Number,
		to: Number
	},
	amount: {
		type: Number,
		required: true
	},
	link: {
		type: String,
		required: true
	},
	qiwi: {
		from: Number,
		to: Number
	},
	price: Number,
	trade: String,
	comment: {
		type: Number,
		required: true,
		// unique: true
	},
	date: {
		type: Date,
		default: new Date()
	}
});

module.exports = model('order', orderSchema)