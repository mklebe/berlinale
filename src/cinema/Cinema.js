

var config = {
    apiKey: process.env.firebaseApiKey,
    authDomain: process.env.firebaseAuthDomain,
    databaseURL: process.env.firebaseDatabaseURL,
    projectId: process.env.firebaseProjectId,
    storageBucket: process.env.firebaseStorageBucket,
};

const firebase = require('firebase')
firebase.initializeApp(config);
const database = firebase.database()

const request = require('request')
const cheerio = require('cheerio')
const {URL} = require('url')

class Cinema {
    constructor() {
        this._pageUrl = 'https://www.berlinale.de/de/programm/spielst_tten/kinos/index.html'
        /** @type {Map<String,String>} */
        this.cinemas = new Map()
    }

    /**
     * @return {Promise}
     */
    initialize() {
        return new Promise(( resolve, reject ) => {
            request(this._pageUrl, (err, response, body) => {
                const $ = cheerio.load(body)
                $('.accordionItem').each((index, cheerioElement) => {
                    this._parseCinemaDataFromDomNode($, cheerioElement);
                })
    
                resolve()
            })
        })
    }

    saveInFireBase() {
        database.ref('cinemas/').set(this.toJson())
    }

    _parseCinemaDataFromDomNode($, cheerioElement) {
        const cinemaName = $(cheerioElement).find('.linkText').text();
        const mapUrl = $(cheerioElement).find('.map').attr('href');
        const mapUrlObject = new URL(mapUrl);
        const coordString = mapUrlObject.searchParams.get('sll');
        /** @type {String} */
        let coords = ''

        /** @type {Number} */
        let latitude;
        /** @type {Number} */
        let longitude;
        if (coordString) {
            latitude = Number.parseFloat(coordString.split(',')[0]);
            longitude = Number.parseFloat(coordString.split(',')[1]);
        }
        else {
            longitude = latitude = 0;
        }
        coords = `${latitude},${longitude}`
        this.cinemas.set(cinemaName, coords);
    }

    toJson() {
        let result = []

        this.cinemas.forEach((value, key ) => {
            result.push({
                name: key,
                location: value,
            })
        })

        return result
    }
}

module.exports = Cinema
