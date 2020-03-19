const { Router } = require('express')
const router = Router()

const vkcoin = require('../models/vkcoin.js')

router.get('/setcallback', async (req, res) => {

	let status = await vkcoin.api.setCallback('https://f90b78ff.ngrok.io/callback/vkcoin')

	res.status(200).json(status) 
})

module.exports = router