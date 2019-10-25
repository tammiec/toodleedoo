const language = require('@google-cloud/language');
const axios = require("axios");
const phrase = process.argv[2];
const projectId = 'project-id';
const keyFilename = './Private/midt-548fb3828ba1.json';
const client = new language.LanguageServiceClient({projectId, keyFilename});
const analyzeText = require('./analyzeText');

const masterCategories = {
  toWatch: {title: 'Film / Series', tags:['film', 'tv', 'serie', 'movie', 'online media']},
  toEat: {title: 'Restaurants, cafes, etc', tags:['restaurant', 'food', 'fast food', 'snack foods', 'reservation']},
  toRead: {title: 'Books', tags:['book', 'magazine', 'literature', 'read']},
  toBuy: {title: 'Products', tags:['shop', 'apparel', 'shopping', 'electronics', 'home', 'beauty', 'autos']}
};

const getResources = response => {
  const res = response.data.items.map(r => {
    const result = { title: r.title, link:r.link, snippet:r.snippet };
    return result;
  });
  return res;
}

const getCategoryAPI = async(input) => {
  const url = 'https://www.googleapis.com/customsearch/v1?fields=items(title,snippet,link)&num=10&key=AIzaSyDFcg70K1aUxF7w3yGLFvZb0sNy5EvucWQ&cx=012299370560497716930:1lnf0ccnkou&q=';
  input = removeTo(input);
  console.log('input', input);
  let foundCats = [];
  try {
    const response = await axios.get(url + input);
    const content = response.data.items.map(r => r.title + ' ' + r.snippet).join(' ');
    // console.log('content', content);
    const document = { content, type: 'PLAIN_TEXT'};
    const [result] = await client.classifyText({document});
    // console.log('result', result.categories);
    // Check if the task starts with a buy verb
    const isBuy = await isVerb(input, 'buy');
    if (!result.categories.length) return null;
    let returnedCat = result.categories[0].name.toLowerCase();
    returnedCat = isBuy ? result.categories.map(c => c.name).join(' ').toLowerCase() : returnedCat;
    // Removes ambiguos category keywords
    returnedCat = replaces(returnedCat);
    Object.keys(masterCategories).map(key => {
      const currentTags = masterCategories[key].tags;
      let found = currentTags.some(t => returnedCat.includes(t));
      if(found) foundCats.push({key, title: masterCategories[key].title, res: getResources(response)}, );
    });
    // console.log('foundCats', foundCats);
    if (foundCats.length > 0) return foundCats;
    else if (result.categories[0]) return [{key:'misc', title: result.categories[0].name, res: getResources(response)}];
    else return null;
  } catch (error) {
    console.log('API Error:', error.message);
    return null;
  }
};

const removeTo = (data) => {
  if (data.trim().substr(0,3).toLowerCase() === 'to ') data = data.slice(3);
  return data.trim();
}

const replaces = string => {
  console.log('string', string);
  const dictionary = {
    'notebooks': 'computers',
    'notebook': 'computer',
  };
  for (const key in dictionary) {
    const rep = new RegExp(key, 'g');
    string = string.replace(rep, dictionary[key]);
  }
  return string;
};

const isVerb = async(text, verb) => {
  try {
    const aT = await analyzeText(text);
    const verbs = aT.phraseAnalyzed.filter(t => t.tag === 'VERB')
    return verbs.length > 0 && verbs[0].text.toUpperCase() === verb.toUpperCase();
  } catch (err) {
    console.error('Error:', err);
  }
};

// (async () => {
//   try {
//       const cat = await getCategoryAPI(phrase);
//       console.log(cat);
//   } catch (e) {
//       console.error('Error:', e);
//   }
// })();


module.exports = getCategoryAPI;

