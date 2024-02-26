/**
 * Accept an blog post in html
 * 
 * @param {string} string of html
 * @returns {Object} 
 * {
 *  titlePlaintext: {string}, 
 *  titleHtml: {string},
 *  bodyPlaintext: {string}
 *  bodyHtml: {string}
 * }
 */

const {htmlToText} = require("html-to-text");

function htmlParser(responseHtml) {
    let titleExtract = responseHtml.match(/<h1>(.*)<\/h1>/g)
    // console.log('title extracted:',titleExtract)
    let titleHtml = titleExtract? titleExtract[0]: ''
    
    let bodyHtmlExtract = responseHtml.match(/<div id="primary-content">([\s\S]*?)<\/div>/)
    // console.log('body extracted:', bodyHtmlExtract)
    let bodyHtml = bodyHtmlExtract ? bodyHtmlExtract[0] : ''
    
    // titlehtml and body html are now extracted
    // now to create plaintext versions

    let titlePlaintext = htmlToText(titleHtml, {
        baseElements: {selectors: ['h1'] },
      })

    let bodyPlaintext = htmlToText(bodyHtml, {
        baseElements: {selectors: ['div#primary-content'] },
      })

    const postData ={
        titlePlaintext,
        titleHtml,
        bodyPlaintext,
        bodyHtml
    }

    // console.log('PARSED HTML POSTDATA:',postData)
    return postData
}

module.exports = htmlParser