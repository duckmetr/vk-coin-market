const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const routes = require(__dirname + '/routes/web.js')

const PORT = process.env.PORT || 3000

const app = express()

const hbs =  exphbs.create({
	extname: 'hbs',
	layoutsDir: __dirname + '/public',
	defaultLayout: 'main',
	partialsDir: __dirname + '/views/partials'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

app.use(require(__dirname + '/routes/web.js'))

app.use(express.static(__dirname + '/public'))

async function init() {
	try {
		await mongoose.connect('mongodb+srv://clash:VladilenPro228@cluster0-ikqhy.mongodb.net/coinmarket', {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		})

		app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))

	} catch (e) {
		console.log(e)
	}
}

init()