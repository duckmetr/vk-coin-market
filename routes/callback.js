const { Router } = require('express')
const router = Router()
const config = require('config')

const vkcoin = require('../models/vkcoin.js')
const order = require('../models/order.js')

// router.get('/setcallback', async (req, res) => {
// 	let status = await vkcoin.api.setCallback('https://f90b78ff.ngrok.io/callback/vkcoin')
// 	res.status(200).json(status) 
// })

router.post('/callback/qiwi', async (req, res) => {

	console.log(req.body)

	let { payment } = req.body

	if (payment) {

		let result = await order.findOne({
			comment: payment.comment,
			amount: payment.sum.amount,
			vk: { from: payment.account, to: config.get('myQiwi') },
			status: 'Ожидание оплаты'
		})

		if (result) {
			console.log('send vkcoin')

			let resPayCoin = await vkcoin.api.sendPayment(result.vk.to, result.amount, true) // 1 коин = 1000 ед.

			result.status = 'Оплачено'
			result.save()
		}
		else {
			console.log('not found order')
		}

	}

	res.status(200).end()
})

module.exports = router