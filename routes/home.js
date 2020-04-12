const { Router } = require('express')
const router = Router()
const config = require('../config')

const vkcoin = require('../models/vkcoin.js')
const order = require('../models/order.js')

const { buyValidator } = require('../middleware/validator')
const { sellValidator } = require('../middleware/validator')
const { validationResult } = require('express-validator')

router.get('/', async (req, res) => {

	let reserve, transaction, countSuccessDealAll, countSuccessDealToday

	try {
		countSuccessDealAll = await order.countDocuments({status: "Успех"})
		// countSuccessDealToday = await order.countDocuments({status: "Успех", date: 12})

		reserve = await vkcoin.api.getMyBalance()

		let transAll = await vkcoin.api.getTransactionList(2)
		transaction = transAll.response.slice(0, 15)
		transaction = transaction.map((item) => {
			let amount = Number(item.amount / 1000).toLocaleString('ru-RU').replace(/[$,]/g, ' ') + '.000'
			let from_id = '***' + String(item.from_id).slice(-4)
			let to_id = '***' + String(item.to_id).slice(-4)
			
			let date = new Date(item.created_at)
			let created_at = date.getHours() + ':' + date.getMinutes()

			return {
				id: item.id,
				from_id,
				to_id,
				amount,
				created_at
			}
		})
	}
	catch (e) {
		reserve = 0	
		transaction = null
	}

	res.render('index', {
		transaction,
		buy: config.price.buy,
		sell: config.price.sell,
		reserve: (reserve / 1000).toLocaleString('ru-RU').replace(/[$,]/g, '.'),
		countSuccessDealAll,
		countSuccessDealToday
	})
})

router.post('/getinfo', async (req, res) => {

	let reserve

	try {
		reserve = await vkcoin.api.getMyBalance() / 1000
	} catch (e) {
		reserve = 0
	}

	res.json({
		buy: config.price.buy,
		sell: config.price.sell,
		reserve
	})
})

router.post('/buyorder', buyValidator, async (req, res) => {

	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	let { vkid, amount } = req.body
	let comment = String(+ new Date()).slice(-7)
	let price = Math.ceil((amount / 1000000 * config.price.sell / 1000) * 10) / 10

	let splitPrice = String(price).split('.')
	if (splitPrice[1].length == 1) splitPrice[1] += '0' // for qiwi payment link

	let link = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${config.myQiwi}&amountInteger=${splitPrice[0]}&amountFraction=${splitPrice[1]}&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=comment&blocked[1]=account&blocked[2]=sum`
	
	let resp = await order.create({
		vk: {
			from: config.myvkid,
			to: vkid
		},
		amount,
		link,
		qiwi: {
			from: '',
			to: config.myQiwi
		},
		exchangeRate: config.price.sell,
		price,
		trade: {
			tip: 'Покупка',
			buy: true,
			sell: false
		},
		comment
	})

	res.json({
		paymentData: {url: link},
		comment: resp._id,
		detail: {vkid, amount, payload: resp._id}
	})
}
)

router.post('/sellorder', sellValidator, async (req, res) => {

	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	let { vkid, amount, qiwi} = req.body
	let comment = String(+ new Date()).slice(-7)
	let link = `https://vk.com/coin#x${config.myvkid}_${amount}_${comment}`

	let price = Math.floor((amount / 1000000 * config.price.buy / 1000) * 100) / 100

	let resp = await order.create({
		vk: {
			from: vkid,
			to: config.myvkid
		},
		amount,
		link,
		qiwi: {
			from: config.myQiwi,
			to: qiwi
		},
		exchangeRate: config.price.buy,
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
	}
)

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

// router.post('/submit',
// 	[
// 	 check('vkid', 'Ваш ID вконтакте должен быть в цифровом виде').isInt({min: 1}),
// 	 check('amount', 'Сумма должна быть не менее 1000 или не более резерва').isInt({min: 1e3, max: 1e20}),
// 	 check('qiwi', 'Ваш QIWI кошелек указан неверно').isMobilePhone(['uk-UA', 'ru-RU'])
// 	],
// 	(req, res) => {

// 		let errors = validationResult(req);
// 		if (!errors.isEmpty()) {
// 			return res.status(422).json({ errors: errors.array() });
// 		}

// 		res.json({ok:  errors.array()})
// 	}
// )

module.exports = router