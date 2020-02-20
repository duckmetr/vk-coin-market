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
	qiwi: {
		from: Number,
		to: Number
	},
	trade:String,
	orderId: {
		type: Number,
		required: true
	},
	status: {
		type: String,
		default: 'waitpayment'
	}
});

module.exports = model('order', orderSchema)