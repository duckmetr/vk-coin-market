const { Router } = require('express')
const router = Router()
const config = require('config')

const vkcoin = require('../models/vkcoin.js')
const order = require('../models/order.js')

const { check, validationResult } = require('express-validator')

router.get('/', async (req, res) => {

	let myBalance
	let transAll
	let transaction

	try {
		// myBalance = 20_000_000_634
		myBalance = await vkcoin.api.getMyBalance()
		transAll = await vkcoin.api.getTransactionList(2)
		transaction = transAll.response.slice(0, 15)
	}
	catch (e) {
		myBalance = 0	
		transaction = null
	}

	res.render('index', {
		transaction,
		buy: config.get('price.buy'),
		sell: config.get('price.sell'),
		reserve: (myBalance / 1000).toLocaleString().replace(/[$,]/g, '.')
	})
})

router.post('/getinfo', async (req, res) => {

	let myBalance

	try {
		// myBalance = 20_000_000_634
		myBalance = await vkcoin.api.getMyBalance()
	}
	catch (e) {
		myBalance = 0
	}

	res.json({
		buy: config.get('price.buy'),
		sell: config.get('price.sell'),
		reserve: myBalance / 1000
	})
})

router.post('/buyorder',
	[
	 check('vkid', 'Ваш ID вконтакте должен быть в цифровом виде').isInt({min: 1}),
	 check('amount', 'Сумма должна быть не менее 1000 или не более резерва').isInt({min: 1e3, max: 1e30})
	],
	async (req, res) => {
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		let { vkid, amount } = req.body

		let comment = String(+ new Date()).slice(-7)
		let price = Math.ceil((amount / 1000000 * config.get('price.sell') / 1000) * 10) / 10

		let splitPrice = String(price).split('.')
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
			detail: {vkid, amount, payload: resp._id}
		})
	}
)

router.post('/sellorder',
	[
	 check('vkid', 'Ваш ID вконтакте должен быть в цифровом виде').isInt({min: 1}),
	 check('amount', 'Сумма должна быть не менее 1000 или количество указано не верно').isInt({min: 1e3, max: 1e30}),
	 check('qiwi', 'Ваш QIWI кошелек указан неверно').isMobilePhone(['uk-UA', 'ru-RU'])
	],
	async (req, res) => {

		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

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

router.post('/submit',
	[
	 check('vkid', 'Ваш ID вконтакте должен быть в цифровом виде').isInt({min: 1}),
	 check('amount', 'Сумма должна быть не менее 1000 или не более резерва').isInt({min: 1e3, max: 1e20}),
	 check('qiwi', 'Ваш QIWI кошелек указан неверно').isMobilePhone(['uk-UA', 'ru-RU'])
	],
	(req, res) => {

		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		res.json({ok:  errors.array()})
	}
)

module.exports = router