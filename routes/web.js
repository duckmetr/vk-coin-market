const { Router } = require('express')
const router = Router()

const vkcoin = require('../models/vkcoin.js')
const order = require('../models/order.js')

router.get('/', async (req, res) => {

	// let transaction = await vkcoin.api.getTransactionList(2)

	let transaction = {response: null}

	res.render('index', {
		transaction: transaction.response,
		sell: 0.0026,
		buy: 0.0024,
		reserve: 17000000
	})
})

router.post('/getinfo', async (req, res) => {

	let myBalance = 17000000
	// let myBalance = await vkcoin.api.getMyBalance()

	res.json({
		sell: 0.0026,
		buy: 0.0024,
		reserve: myBalance
	})
})

router.post('/buyorder', async (req, res) => {

	//let result = await vkcoin.api.sendPayment(req.body.vkid, req.body.amount, true) // 1 коин = 1000 ед.
    
	order.create({
		vkid: req.body.vkid,
		amount: req.body.amount,
		qiwi: {
			from: 0,
			to: 380977125282
		},
		trade: 'buy',
		orderId: 228
	})

    console.log(req.body)

	res.json(req.body)
})

router.post('/sellorder', async (req, res) => {

	let link = await vkcoin.api.getLink(req.body.amount, true)
	let { vkid, amount, qiwi} = req.body

	order.create({
		vkid,
		amount,
		qiwi: {
			from: 380977125282,
			to: qiwi
		},
		trade: 'sell',
		orderId: 69
	})

	res.json({
		paymentData: {url: link},
		orderId: 'randomString',
		detail: {id: req.body.vkid, amount: req.body.amount, payload: 'number'}
	})
})

router.get('/order/:order', async (req, res) => {
	
	try {
		let orderJson = await order.findById(req.params.order)
		console.log(orderJson)
		res.json(orderJson)
	}
	catch (e) {
		console.log(e.message)
		res.status(500).send('no found')
	}
	
	res.end()
	
	//res.json(orderJson)

	//res.render('order')
})

module.exports = router