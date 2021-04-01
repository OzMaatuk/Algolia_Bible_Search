const fs = require('fs');
const fetch = require('node-fetch');
let URL929 = "http://bible.s40.upress.link/json/index.php";

const hebrewBook = {
    'genesis' : "בראשית",
    'exodus' : "שמות",
    'leviticus' : "ויקרא",
    'numbers' : "במדבר",
    'deuteronomy' : "דברים"
}

const hebrewLetters = {
    1: "א",
    2: "ב",
    3: "ג",
    4: "ד",
    5: "ה",
    6: "ו",
    7: "ז",
    8: "ח",
    9:"ט",
    10:"י",
    11:"יא",
    12:"יב",
    13:"יג",
    14:"יד",
    15:"טו",
    16:"טז",
    17:"יז",
    18:"יח",
    19:"יט",
    20:"כ",
    21:"כא",
    22:"כב",
    23:"כג",
    24:"כד",
    25:"כה",
    26:"כו",
    27:"כז",
    28:"כח",
    29:"כט",
    30:"ל",
    31:"לא",
    32:"לב",
    33:"לג",
    34:"לד",
    35:"לה",
    36:"לו",
    37:"לז",
    38:"לח",
    39:"לט",
    40:"מ"
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function get929ChapterURL(book, chapter)
{
    params = {
        'url': URL929,
        'action': 'get_chapter_info',
        'books_group': 'torah',
        'book': book,
        'chapter': chapter
    };

    httpgeturl = params.url;
    httpgeturl += '?action=' + params.action;
    httpgeturl += '&books_group=' + params.books_group;
    httpgeturl += '&book=' + params.book;
    httpgeturl += '&chapter=' + params.chapter;

    return httpgeturl;
}

function get929DescriptionURL(post_id, description_id, type)
{
    params = {
        'url': URL929,
        'action': 'get_post_description',
        'post_id': post_id,
        'description_id': description_id,
        'post_type': type
    };

    httpgeturl = params.url;
    httpgeturl += '?action=' + params.action;
    httpgeturl += '&post_id=' + params.post_id;
    httpgeturl += '&description_id=' + params.description_id;
    httpgeturl += '&post_type=' + params.post_type;

    return httpgeturl;
}

async function HTTPGet(httpgeturl){
    console.log("-------------------------------------------------------");
    console.log("HTTPGet: httpgeturl " + httpgeturl);
    console.log("-------------------------------------------------------");

    const fetchData = await fetch(httpgeturl)
            .then(response => response.json()).then(function(json) {
                return json;
            }).catch(function(err) {
                console.log(err); // add here handlinf ex
                return 'ERROR';
            });
    return fetchData;
}

async function getChapterData(book, chapter)
{
    return await HTTPGet(get929ChapterURL(book, chapter));
}

/*---------------------------
available types:
    persons
    places
    words
    phrases
----------------------------*/
async function getExtendedData(chapterData, type)
{
    console.log("-------------------------------------------------------");
    console.log("getExtendedData: type " + type);
    console.log("-------------------------------------------------------");

    let typeData = chapterData[type];   
    let array = [];
    if (!typeData)
        return array;

    for (let i of typeData)
    {
        let post_id = i['post_id'];
        let description_id = i['description_id'];
        array.push(await HTTPGet(get929DescriptionURL(post_id, description_id, type)));
    }

    return array;
}

function writeToFile(fileName, talkBitesJson)
{
    fs.writeFile(fileName, JSON.stringify(talkBitesJson), function(error) {
        if(error) { 
                console.log('[write file]: ' + error);
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

async function collectChapters(book, chapter)
{
    console.log("-------------------------------------------------------");
    console.log("collectChapters: book " + book + " chapter " + chapter);
    console.log("-------------------------------------------------------");

    let data = {};
    let chapterData = await getChapterData(book, chapter);
    while (chapterData === 'ERROR')
    {
        await sleep(1000);
        chapterData = await getChapterData(book, chapter);
    }
    chapterData = chapterData['info'];
    data['book'] = book;
    data['heb_book'] = hebrewBook[book];
    data['chapter'] = chapter;
    data['heb_chapter'] = hebrewLetters[chapter];
    data['verses'] = chapterData.verses;
    data['verses_without_nikud'] = chapterData.verses_without_nikud;
    data['verses_with_taamim'] = chapterData.verses_with_taamim;
    data['pre_text'] = chapterData.pre_translate_text;
    data['description'] = chapterData.descrition;
    data['translates'] = chapterData.translates;
    data['paragraphs'] = chapterData.paragraphs;
    data['mafmar'] = chapterData.translates_mafmar;
    data['persons'] = await getExtendedData(chapterData, 'persons');
    data['places'] = await getExtendedData(chapterData, 'places');
    data['words'] = await getExtendedData(chapterData, 'words');
    data['phrases'] = await getExtendedData(chapterData, 'phrases');
    
    return data;
}

async function collectBook(book)
{
    console.log("-------------------------------------------------------");
    console.log("collectBook: book " + book);
    console.log("-------------------------------------------------------");

    let data = [];
    let numOfChapters = await getBookNumberOfChapters(book);
    for (let chapter = 1; chapter < numOfChapters; chapter++)
    {
        data.push(await collectChapters(book, chapter));
    }

    return data;
}

module.exports = {
    start: async () =>
    {
        writeToFile('./exportedBible/exportedBereshit.json', await collectBook('genesis'));
        writeToFile('./exportedBible/exportedShmot.json', await collectBook('exodus'));
        writeToFile('./exportedBible/exportedVaykra.json', await collectBook('leviticus'));
        writeToFile('./exportedBible/exportedBamidbar.json', await collectBook('numbers'));
        writeToFile('./exportedBible/exportedDvarim.json', await collectBook('deuteronomy'));
    }
}
module.exports.start();