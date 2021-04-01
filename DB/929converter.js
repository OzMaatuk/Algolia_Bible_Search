const fs = require('fs');
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
let objectID = 0;

function numberToHebLetter(number)
{
    return hebrewLetters[number];
}

function getRelatedParagraph(verse_number, paragraphs_array)
{
    if (!paragraphs_array || paragraphs_array.length == 0)
        return "NO_PARAGRAPH_RELATED";
    for (let i of paragraphs_array)
    {
        if (verse_number >= Number(i.verse_nember)) return i.title;
    }
}

function getTextArrayFromExtension(extension) //make it by verse
{
    let result = [];
    if (!extension) return [];
    for (let i of extension)
    {
        result.push(i.title);
    }
    return result;
}

function collectVersesObjects(chapterContent)
{
    let result = []
    //let filtering = [];
    let searching = [];
    for (let i = 0; i<chapterContent["verses"].length; i++)
    {
        let filtering = ["פסוק"];
        //let searching = (chapterContent["book"] + " " + chapterInHebrew + " פסוק " + verseInHebrew);
        //searching = [searching];

        /*
        let mafmar = "";
        if (chapterContent["mafmar"])
            mafmar = (chapterContent["mafmar"]["" + verse_number]);
        */

        let verse_number = i+1;
        let text = chapterContent["verses_without_nikud"][i].verse;
        let text_with_vocalization = chapterContent["verses"][i].verse;
        let text_with_taste = chapterContent["verses_with_taamim"][i].verse;
        let translate = chapterContent["translates"]["" + verse_number];
        if (!translate) translate = "";
        translate = translate.replace(/(<([^>]+)>)/ig,"");

        result.push({
            "objectID": objectID,
            "type": "VERSE",
            "book": chapterContent["book"],
            "heb_book":  chapterContent["heb_book"],
            "chapter": chapterContent["chapter"],
            "heb_chapter": chapterContent["heb_chapter"],
            "verse_number": verse_number,
            "heb_verse": numberToHebLetter(verse_number),
            "text": text,
            "text_with_vocalization": text_with_vocalization,
            "text_with_taste": text_with_taste,
            "translate": translate,
            "persons": getTextArrayFromExtension(chapterContent['persons']),
            "places": getTextArrayFromExtension(chapterContent['places']),
            "words": getTextArrayFromExtension(chapterContent['words']),
            "phrases": getTextArrayFromExtension(chapterContent['phrases']),
            "title": getRelatedParagraph(verse_number, chapterContent['paragraphs']),
            "searching": searching,
            "displaying": ["text"],
            "filtering": filtering,
            "ranking": 1
        });
        objectID++;
    }
    return result;
}

function collectExtensionObjects(chapterContent)
{
    let result = [];

    //let filterChapter = "פרק " + numberToHebLetter(chapterContent["chapter"]);
    //let filtering = [chapterContent["book"], "אנשים", filterChapter];
    result = getArrayFromExtension(result, chapterContent, 'persons');
    result = getArrayFromExtension(result, chapterContent, 'places');
    result = getArrayFromExtension(result, chapterContent, 'words');
    result = getArrayFromExtension(result, chapterContent, 'phrases');

    if (!chapterContent["paragraphs"]) return result;

    //for (let [i,v] of chapterContent["paragraphs"])
    for (let i = 0; i < chapterContent["paragraphs"].length; i++)
    {
        let v = chapterContent["paragraphs"][i];
        let verse_number = Number(v.verse_nember);
        let verses = [];
        let verses_numbers = [];
        let next_paragraph_verse = 0;
        if (chapterContent["paragraphs"][i+1])
            next_paragraph_verse = chapterContent["paragraphs"][i+1].verse_nember;
        for (let verse_counter = verse_number; verse_counter < next_paragraph_verse; verse_counter++)
        {
            verses.push(chapterContent["verses"][verse_counter].verse);
            verses_numbers.push(verse_counter);
        }

        result.push({
            "objectID": objectID,
            "type": "PARAGRAPH",
            "book": chapterContent["book"],
            "title": v.title,
            "chapter": chapterContent["chapter"],
            "translate": "",
            "verses_numbers": verse_number,
            "verses": verses,
            "persons": [],
            "places": [],
            "words": [],
            "phrases": [],
            "searching": [],
            "displaying": [],
            "filtering": [],
            "ranking": 1
        });
    }

    return result;
}

function extensionAlreadyIncluded(source, value)
{
    regVal = new RegExp(value,"g");
    for (let [i,v] of source.entries())
        if (v.title.match(regVal)) return i;
    return false;
}

const typeInHebrew = {
    "persons" : "דמות",
    "places" : "מקום",
    "words" : "מילה",
    "phrases" : "ביטוי"
}

function getArrayFromExtension(result, chapterContent, type)
{
    let searching = [];
    let filtering = [];
    for (let i of chapterContent[type])
    {
        let index = extensionAlreadyIncluded(result, i.title)
        if (index)
        {
            console.log("-------------------------------");
            console.log("i: " + JSON.stringify(i));
            console.log("result[i]: " + JSON.stringify(result[index]));
            console.log("index: " + index);
            console.log("-------------------------------");
            result[index].chapter = Array(result[index].chapter).push(chapterContent["chapter"]);
        }
        else if(i.text)
        {
            let appearOnVerses = []; //getVersesWithExtension
            //let searching = "מי היה " + i.title;
            //searching = [searching];
            let filtering = [typeInHebrew[type]];
            result.push( {
                    "objectID": objectID,
                    "type": type,
                    "book": chapterContent["book"],
                    "chapter": chapterContent["chapter"],
                    "title": i.title,
                    "text": i.text.replace(/(<([^>]+)>)/ig,"").replace(/&quot;/g, ""),
                    "paragraphs": [],
                    "verses": appearOnVerses,
                    "searching": searching,
                    "displaying": ["text"],
                    "filtering": filtering,
                    "ranking": 1
                }
            );
            objectID++;
        }
    }
    return result;
}

/*
function removeHTML(str)
{ return str.replace(/(<([^>]+)>)/ig,"");}

function getExtensionsInVerse(value, extension)
{
    if (!extension) return [];
    let result = [];
    let regValue = new RegExp(value,"g");
    console.log("---------------------------------------");
    console.log("checking value: " + value + " and regValue: " + regValue);
    for (let i of extension)
    {
        let tmp = new RegExp(i.title,"g");
        console.log("i: " + i + " tmp: " + tmp);
        if (regValue.test(tmp)) { console.log("FOUND"); result.push(i.title); }
    }
    console.log("result: " + result);
    console.log("---------------------------------------");
    return result;
}

function getVersesWithExtension(value, extension)
{

}
*/

function createDB(sourcefile)
{
    data = require(sourcefile);
    return collectChapters(data);
}

function collectChapters(content)
{
    let result = [];
    for (let i of content)
    {
        let tmp = collectVersesObjects(i);
        for (let j of tmp)
        {
            result.push(JSON.stringify(j));
        }
    }

    for (let i of content)
    {
        let tmp = collectExtensionObjects(i);
        for (let j of tmp)
        {
            result.push(JSON.stringify(j));
        }
    }
    return result;
}

function writeToFile(fileName, talkBitesJson)
{
    fs.writeFile(fileName, '['+talkBitesJson+']', function(error) {
        if(error) { 
                console.log('[write file]: ' + error);
                if (fail)
                fail(error);
        } else {
                console.log('[write file]: success');
        }
    });
}

module.exports = {
    start: () =>
    {
        writeToFile('./convertedBible/convertedBereshit.json', createDB('./exportedBible/exportedBereshit.json'));
        writeToFile('./convertedBible/convertedShmot.json', createDB('./exportedBible/exportedShmot.json'));
        writeToFile('./convertedBible/convertedVaykra.json', createDB('./exportedBible/exportedVaykra.json'));
        writeToFile('./convertedBible/convertedBamidbar.json', createDB('./exportedBible/exportedBamidbar.json'));
        writeToFile('./convertedBible/convertedDvarim.json', createDB('./exportedBible/exportedDvarim.json'));
    }
}
module.exports.start();