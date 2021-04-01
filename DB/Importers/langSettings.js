const fs = require('fs');
const algoliasearch = require('algoliasearch');

const client = algoliasearch('appID', 'APIKey');
const someIndex = client.initIndex('BIBLE');

let DBArray = fs.readFileSync('','UTF8');
DBArray = JSON.parse(DBArray);
someIndex
    .addObject(DBArray)
    .then(content => console.log(content))
    .catch(err => console.log(err));