const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const config = require('config')

const routes = require(__dirname + '/routes/web')

const hbs =  exphbs.create({
	extname: 'hbs',
	layoutsDir: __dirname + '/public',
	defaultLayout: 'MainTemplate',
	partialsDir: __dirname + '/views/partials'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.json())
app.use(require(__dirname + '/routes/web.js'))
app.use(express.static(__dirname + '/public'))

async function init() {
	try {
		await mongoose.connect('mongodb+srv://clash:VladilenPro228@cluster0-ikqhy.mongodb.net/coinmarket', {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		})

		const PORT = config.get('PORT')

		app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))

	} catch (e) {
		console.log(e)
	}
}

init()