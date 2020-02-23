const {Schema, model} = require('mongoose')

const orderSchema = new Schema({
	vkid: {
		type: Number,
		required: true
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
	rate: Number,
	trade: String,
	orderId: {
		type: Number,
		required: true,
		unique: true
	},
	status: {
		type: String,
		default: 'Ожидание оплаты'
	},
	date: {
		type: Date,
		default: new Date()
	}
});

module.exports = model('order', orderSchema)