import '../css/flatly.css'
import '../css/main.css'

import CountUp from './CountUp.js'
import QRCode from 'qrcode'
// import bootoast from './bootoast'

let pillsBuyTab = document.getElementById('pills-buy-tab')
let pillsSellTab = document.getElementById('pills-sell-tab')
let refreshInfoBtn = document.getElementById('refreshInfo')

let buyRateInfo = document.getElementById('buyRateInfo')
let sellRateInfo = document.getElementById('sellRateInfo')
let reserveInfo = document.getElementById('reserveInfo')

let buyIdInput = document.querySelector('.id-buy-input')
let buyCoinsInput = document.querySelector('.amount-buy-coins')

let sellIdInput = document.querySelector('.id-sell-input')
let sellCoinsInput = document.querySelector('.amount-sell-coins')
let sellQiwiInput = document.querySelector('.sell-qiwi-phone')

let buyResultAmountCoins = document.querySelector('.buyResultAmountCoins')
let buyResultAmountPrice = document.querySelector('.buyResultAmountPrice')

let sellResultAmountCoins = document.querySelector('.sellResultAmountCoins')
let sellResultAmountPrice = document.querySelector('.sellResultAmountPrice')

let buyModalBtn = document.getElementById('buyModalBtn')
let sellModalBtn = document.getElementById('sellModalBtn')

let sellQrImg = document.querySelector('.sell-qr-img')
let sellCoinUrl = document.querySelector('.sell-coin-url')
let sellCheckLink = document.querySelector('.check-sell-link')

generateQR(sellCoinUrl.href)

async function generateQR(text) {
  try {
    sellQrImg.src = await QRCode.toDataURL(text)
  } catch (err) {
    console.error(err)
  }
}

let toggleTabs = () => {
	document.getElementById('pills-buy-tab').classList.toggle('active')
	document.getElementById('pills-sell-tab').classList.toggle('active')

	document.querySelectorAll('.tab-pane').forEach(item => {
		item.classList.toggle('show')
		item.classList.toggle('active')
	})
}

let getInfo = () => {
	fetch('/getinfo', {method:'post'})
	.then(response => response.json())
	.then(data => updatePriceList(data))
	.catch(e => console.error(e.message))
}

let buyOrder = (url, body) => {
	fetch(url, {method: 'post', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
	.then(response => response.json())
	.then(data => {
        window.open(data.paymentData.url, '_blank')
        window.location.href = '/order/' + data.detail.payload
    })
	.catch(e => console.log(e.message))
}

let sellOrder = (url, body) => {
	fetch(url, {method: 'post', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
	.then(response => response.json())
	.then(data => {
        // window.open(data.paymentData.url, '_blank')
        generateQR(data.paymentData.url)

        sellCoinUrl.setAttribute('href',data.paymentData.url)
        sellCoinUrl.innerText = data.paymentData.url
        sellCheckLink.setAttribute('href','/order/' + data.detail.payload)
        //дічь ot лохов
        sellModal.classList.add('active')
        document.querySelector('.modal-backdrop').classList.add('modal-show')
    })
	.catch(e => console.log(e.message))
}

buyCoinsInput.oninput = event => {
	let amount = event.target.value
    if(amount.length > 14) {
        event.preventDefault()
        return false
    }
    let price = Math.ceil((amount / 1000 * sellRateInfo.innerText / 1000) * 10) / 10

    buyResultAmountCoins.innerText = toCoinsFormat(amount)
    buyResultAmountPrice.innerText = price
}

sellCoinsInput.oninput = event => {
    let amount = event.target.value
    if(amount.length > 14) {
        event.preventDefault()
        return false
    }
    let price = Math.floor((amount / 1000 * buyRateInfo.innerText / 1000) * 100) / 100

    sellResultAmountCoins.innerText = toCoinsFormat(amount)
    sellResultAmountPrice.innerText = price
}

buyModalBtn.onclick = event => {
    event.preventDefault()

    let vkid = Number(buyIdInput.value)
    let amount = Number(buyCoinsInput.value) * 1000
    let reserve = Number(reserveInfo.innerText.replace(/\s+/g, '')) * 1000
    let price = Math.ceil((amount / 1000 * sellRateInfo.innerText / 1000) * 10) / 10

    if (true) {
    // if (vkid && amount && price > 1 && amount < reserve) {

        buyOrder('/buyorder', {vkid, amount})

        // window.open(data.paymentUrl, '_blank')
        // window.open('/order/' + data.orderId,'_self')

    } else {
        // if (!amount) bootoast.toast({type: 'danger', message: "Заполните поле id корректно - id вконтакте должен быть цифрами"})
        // if (price < 1) bootoast.toast({type: 'danger', message: "Cумма покупки должна быть больше 1рубля"})
        // // if (amount && amount > reserve) bootoast.toast({type: 'danger', message: "Покупка должна быть меньше резерва"})
    }
    return false
}

sellModalBtn.onclick = event => {
    event.preventDefault()

    let vkid = Number(sellIdInput.value)
    let amount = Number(sellCoinsInput.value) * 1000
    let qiwiWallet = Number(sellQiwiInput.value)
    let price = Math.ceil((amount / 1000 * buyRateInfo.innerText / 1000) * 10) / 10

    if (vkid && amount && price >= 1 && qiwiWallet) {

        sellOrder('/sellorder', {vkid, amount, qiwi: qiwiWallet})

    } else {
        // if (!vkid) bootoast.toast({type: 'danger', message: "Заполните поле id корректно - id вконтакте должен быть цифрами"})
        // if (!qiwiWallet) bootoast.toast({type: 'danger', message: "Укажите ваш qiwi кошелек, на который придут средства"})
        // if (price < 1) bootoast.toast({type: 'danger', message: "Cумма продажи должна быть больше 1 рубля"})
    }
    return false
}

let updatePriceList = (data) => {
	buyRateInfo.innerText = data.buy
	sellRateInfo.innerText = data.sell

	let animateNumber = new CountUp('reserveInfo', data.reserve / 1000, {
		decimalPlaces: 3,
		separator: ' '
	})
	animateNumber.start()
}

let toCoinsFormat = amount => (amount * 1).toLocaleString('ru-RU')

//event listeners
pillsBuyTab.addEventListener('click', toggleTabs)
pillsSellTab.addEventListener('click', toggleTabs)
refreshInfoBtn.addEventListener('click', getInfo)

document.querySelector('.modal-close').addEventListener('click', e => {
    sellModal.classList.remove('active')
    document.querySelector('.modal-backdrop').classList.remove('modal-show')
})

setInterval(getInfo, 25000)