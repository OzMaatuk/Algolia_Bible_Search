const fs = require('fs');

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

function isExistByTitle(data, value)
{
    for (let i of data)
    {
        if (value === i.title) {console.log("FOUND"); return true;}
    }
    return false;
}

module.exports = {
    start: () =>
    {
        let source = require('./BareshitByVerses.json');
        let result = [];
        for (let i = 0; i < source.length; i++)
        {
            let current = source[i];
            if (!isExistByTitle(result, current.title) || (current.type === 'VERSE'))
                result.push(current);
        }
        console.log("------------------------");
        console.log("LENGTH");
        console.log(result.length);
        console.log(source.length);
        console.log("------------------------");
        writeToFile('BereshitWithputDuplicates.json', result);
    }
}
module.exports.start();