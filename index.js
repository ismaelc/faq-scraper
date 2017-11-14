const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const htmlToText = require('html-to-text')
const rp = require('request-promise')
//const utils = require('./utils.js')
const helpers = require('./scrapehelper.js')

app.set('port', (process.env.PORT || 5000))

//support parsing of application/json type post data
app.use(bodyParser.json())
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: true}))

app.set('json spaces', 5);

app.get('/*', function(request, response) {

    // Get path after root domain, our target url. Remove prepended /
    let url = request.path.replace(/^\/+/, '')
    url = url.replace(/[#?,]\s*$/,'')
    // No url was passed
	if (!url) {
		response.send('No url')
		return
	}

    // Add protocol if missing
	if (url.indexOf('://') == -1)
		url = 'https://' + url

    rp(url)
    .then(function(htmlString) {

        let selector = request.query['faq_select']
        if(!selector) {
            // Rewrite page with hover'd css

            let cheerio = require('cheerio'),
                $ = cheerio.load(htmlString);

            helpers.fixLocalLinks($, url);
            helpers.addScriptsCss($);

			//response.send($.html());
            return { json: false, body: $.html() }
        }
        else {
            // Get string from html
            let text = htmlToText.fromString(htmlString, {
            	wordwrap: false,
                preserveNewlines: true,
                singleNewLineParagraphs: true,
                ignoreHref: true,
                //linkHrefBaseUrl: extractHostname(url),
                baseElement: [selector]
            })

            // Split response into sentences via \n
            const split_text = text.split('\n')
            // Initialize q&a pairs object
            let qa = {}
            let t = ''
            split_text.forEach(s => {
                s = s.trim()
                // If sentence is a question, add as key
                if (s.slice(-1) === "?") {
                    // Initialize key
                    qa[s] = ''
                    // Remember key to collect answers
                    t = s
                }
                // Sentence is not a question, add to answer
                else {
                    // Collect answers to key. Exclude first non-question entries
                    if(t != '') qa[t] += `${s} `
                }
            })

            //console.log(split_text)
            //console.log(qa)
            //response.send(qa)
            return { json: true, body: qa }

        }
    })
    .then(html_response => {
        console.log(html_response.json)
        if(html_response.json) response.json(html_response.body)
        else response.send(html_response.body)
    })
    .catch(function(err) {
    	// Crawling failed...
        console.log(`Err: ${err}`)
        response.send(err)
    })
})

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'))
})
