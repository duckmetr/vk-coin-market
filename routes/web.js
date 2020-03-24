const { Router } = require('express')
const router = Router()
// const mongoose = require('mongoose')

const { check, validationResult } = require('express-validator')

const vkcoin = require('../models/vkcoin.js')
const order = require('../models/order.js')

const config = require('config')

router.get('/', async (req, res) => {

	let myBalance
	let transAll
	let transaction

	try {
		myBalance = await vkcoin.api.getMyBalance()
		transAll = await vkcoin.api.getTransactionList(2)

		transaction = transaction.response.slice(0, 10)
	}
	catch (e) {
		myBalance = 18_000_000	
		transaction = null
	}

	res.render('index', {
		transaction,
		buy: config.get('price.buy'),
		sell: config.get('price.sell'),
		reserve: myBalance
	})
})

router.post('/getinfo', async (req, res) => {

	let myBalance

	try {
		myBalance = await vkcoin.api.getMyBalance()
	}
	catch (e) {
		myBalance = 18_000_000
	}

	res.json({
		buy: config.get('price.buy'),
		sell: config.get('price.sell'),
		reserve: myBalance
	})
})

router.post('/buyorder', async (req, res) => {

	let { vkid, amount, qiwi } = req.body

	let comment = String(+ new Date()).slice(-7)
	let price = Math.ceil((amount / 1000000 * config.get('price.sell') / 1000) * 10) / 10

	let splitPrice = String(price).split('.', 2)
	if (splitPrice[1].length == 1) splitPrice[1] += '0' // for qiwi payment link

	let link = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${config.get('myQiwi')}&amountInteger=${splitPrice[0]}&amountFraction=${splitPrice[1]}&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=comment&blocked[1]=account&blocked[2]=sum`
	
	let resp = await order.create({
		// _id: new mongoose.Types.ObjectId(),
		vk: {
			from: config.get('myvkid'),
			to: vkid
		},
		amount,
		link,
		qiwi: {
			from: '',
			to: config.get('myQiwi')
		},
		exchangeRate: config.get('price.sell'),
		price,
		trade: {
			tip: 'Покупка',
			buy: true,
			sell: false
		},
		comment
	})

    console.log(resp)

	res.json({
		paymentData: {url: link},
		comment: resp._id,
		detail: {id: req.body.vkid, amount: req.body.amount, payload: resp._id}
	})
})

router.post('/sellorder', async (req, res) => {

	let { vkid, amount, qiwi} = req.body
	let comment = String(+ new Date()).slice(-7)
	let link = `https://vk.com/coin#x${config.get('myvkid')}_${amount}_${comment}`

	let price = Math.floor((amount / 1000000 * config.get('price.buy') / 1000) * 100) / 100

	let resp = await order.create({
		// _id: new mongoose.Types.ObjectId(),
		vk: {
			from: vkid,
			to: config.get('myvkid')
		},
		amount,
		link,
		qiwi: {
			from: config.get('myQiwi'),
			to: qiwi
		},
		exchangeRate: config.get('price.buy'),
		price,
		trade: {
			tip: 'Продажа',
			buy: false,
			sell: true
		},
		comment
	})

	res.json({
		paymentData: {url: link},
		detail: {id: vkid, amount, payload: resp._id}
	})
})

router.get('/order/:order', async (req, res) => {
	
	try {
		let orderJson = await order.findById(req.params.order)

		orderJson ? res.status(200).render('order', orderJson) : res.status(404).send('no found')
	}
	catch (e) {
		console.log(e.message)
		res.status(404).send('no found')
	}
})

module.exports = router