const fs = require('fs');
const fetch = require('node-fetch');
let URL929 = "http://bible.s40.upress.link/json/index.php?action=get_chapter_info&books_group=torah&book=genesis&chapter=";

async function HTTPGet(httpgeturl){
    const fetchData = await fetch(httpgeturl)
            .then(response => response.json()).then(function(json) {
                return json;
            }).catch(function(err) {
                console.log(err);
            });
    return fetchData;
}

function writeToFile(fileName, talkBitesJson)
{
    fs.writeFile(fileName, JSON.stringify(talkBitesJson), function(error) {
        if(error) { 
                console.log('[write file]: ' + err);
                if (fail)
                fail(error);
        } else {
                console.log('[write file]: success');
        }
    });
}

async function getBookNumberOfChapters(book)
{
    let httpgeturl = 'http://bible.s40.upress.link/json/index.php?action=get_book_info&books_group=torah&book='+book;
    const fetchData = await fetch(httpgeturl)
            .then(response => response.json()).then(function(json) {
                return json;
            }).catch(function(err) {
                console.log(err);
            });
    return fetchData['numberOfChapters'];
}

module.exports = {
    start: async () =>
    {
        let book = 'genesis';
        let numOfChapters = await getBookNumberOfChapters(book);
        numOfChapters--;
        let result = []; 
        for (let i = 1; i < numOfChapters; i++)
        {
            let curURL = URL929 + i;
            result.push(await HTTPGet(curURL));
        }
        writeToFile('originalBereshit.json', result);
    }
}
module.exports.start();