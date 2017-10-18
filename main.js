var fs = require('fs')
//var got = require('got')
//var xml2js = require('xml2js')
var req = require('request')
var cheerio = require('cheerio')
var handlebars = require('handlebars')
var html2png = require('html2png')
var wallpaperFolder = 'C:\\Users\\meep\\Pictures\\xkcd wallpaper\\'
var HowManyToKeepAround = 20


function getImageInfo(){
    return new Promise((resolve,reject) => {
         req("https://xkcd.com/",(err,res,body) => {
             if(err) return reject(err)
             var $ = cheerio.load(body)
             var currentImg = $('#comic img')[0].attribs
             var currentNum = $('#middleContainer').text().match(/xkcd\.com\/(\d+)/)[1]
             req("https://xkcd.com/"+Math.floor(Math.random()*(currentNum-1)+1), (err,res,body) => {
                 if(err) return reject(err)
                 var $ = cheerio.load(body)
                 var randomImg = $('#comic img')[0].attribs
                 resolve([randomImg,currentImg])
             })
         })
    })
}

function mashIntoHTML(data){
    data.forEach(img => img.src = "https:"+img.src)
    var template = handlebars.compile(fs.readFileSync('handlebars.html','utf-8'))
    var html = template({imgs:data})
//    console.log(html)
    return html
}

function takeScreenShots(html){
    return new Promise((resolve,reject) => {
        var screenshot = html2png({width:1920,height:1080,browser:'phantomjs'})
        screenshot.render(html,(err,data)=> {
            if (err) return screenshot.error(err, ()=>{});
            fs.writeFileSync(wallpaperFolder+'img.png',data)
            screenshot.close(resolve);
        })
    })
}

getImageInfo()
    .then(mashIntoHTML)
    .then(takeScreenShots)
    .catch(console.error)