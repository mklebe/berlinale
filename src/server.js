require('dotenv').config()

const Cinema = require('./cinema/Cinema')

const cinema = new Cinema()

cinema.initialize().then(() => {
    cinema.saveInFireBase()
})