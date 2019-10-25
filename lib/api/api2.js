const language = require('@google-cloud/language');
const axios = require("axios");
const phrase = process.argv[2];
const projectId = 'project-id';
const keyFilename = './Private/midt-548fb3828ba1.json';
const client = new language.LanguageServiceClient({ projectId, keyFilename });
const analyzeText = require('./analyzeText');

const masterCategories = {
  toWatch: { title: 'Film / Series', tags: ['film', 'serie', 'movie', 'online media', 'animation', 'videos', 'humor'] },
  toEat: { title: 'Restaurants, cafes, etc', tags: ['restaurant', 'food', 'drink', 'fast food', 'snack foods', 'reservation'] },
  toRead: { title: 'Books', tags: ['magazine', 'literature', 'read'] },
  toBuy: { title: 'Products', tags: ['shop', 'apparel', 'shopping', 'electronics', 'beauty', 'autos', 'good'] },
  misc: {title: 'Miscelaneous', tags: ['home']},
};

// flexxo general key
const _url = 'https://www.googleapis.com/customsearch/v1?num=10&key=AIzaSyDFcg70K1aUxF7w3yGLFvZb0sNy5EvucWQ&cx=012299370560497716930:1lnf0ccnkou&q=';
// flexxo imdb key
// const _url = 'https://www.googleapis.com/customsearch/v1?num=10&key=AIzaSyDFcg70K1aUxF7w3yGLFvZb0sNy5EvucWQ&cx=012299370560497716930:uc6ebchjlid&q=';


// paroxismo key
//const _url = 'https://www.googleapis.com/customsearch/v1?num=3&key=AIzaSyDUQFpNAUExV3U1BBNutdsIodFbNPyteUI&cx=012299370560497716930:1lnf0ccnkou&q=';

const catURLs = {
  toWatch: 'site:www.imdb.com ',
  toEat: 'site:www.yelp.com ',
  toRead: 'site:www.goodreads.com ',
  toBuy: 'site:www.walmart.com ',
  //misc: ''
};

const getAllCategoryAPIrace = (input) => {
  return new Promise((resolve, reject) => {
    input = removeTo(input);
    console.log('input', input);
    let foundCats = [];
    const toWatchProm = axios.get(_url + catURLs.toWatch + input);
    const toEatProm = axios.get(_url + catURLs.toEat + input);
    const toReadProm = axios.get(_url + catURLs.toRead + input);
    const toBuyProm = axios.get(_url + catURLs.toBuy + input);
    //const responses = [];
    Promise.all([toWatchProm, toEatProm, toReadProm, toBuyProm])
      .then(res => {
        const promises = [];
        res.map(async response => {
          if (response.data.items) {
            const content = response.data.items.map(r => r.title + ' ' + r.snippet).join(' ');
            const document = { content, type: 'PLAIN_TEXT' };
            promises.push(client.classifyText({ document }));
            //responses.push(response);
          }
        });
        return promises;
      })
      .then(promises => {
        Promise.all(promises)
          .then(res => {
            res.map((r, ix) => {
              if (r.length) {
                foundCats.push(r[0].categories[0]);
                console.log('r[0].categories[0]', r[0].categories[0]);
              }
            });

            foundCats.sort((a, b) => b.confidence - a.confidence);
            foundCats = checkToLocalCats(generalResponse, foundCats[0], true);
            return foundCats;
          })
          .then(res => {
            resolve(res);
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

const getAllCategoryAPI = async (input) => {
  input = removeTo(input);
  console.log('input', input);
  let foundCats = [];
  for (const key in catURLs) {
    try {
      // console.log('url', key);
      const response = await axios.get(_url + catURLs[key] + input);
      if (!response.data.items) {
        // console.log('No good category');
        continue;
      }
      const content = response.data.items.map(r => r.title + ' ' + r.snippet).join(' ');
      const document = { content, type: 'PLAIN_TEXT' };
      const [result] = await client.classifyText({ document });

      foundCats.push(result.categories[0]);
    } catch (error) {
      console.log('API Error:', error);
      return null;
    }
  }
  foundCats.sort((a, b) => b.confidence - a.confidence);
  console.log('foundCats', foundCats);
};

let generalResponse;
const getCategoryAPI = async (input) => {
  //input = removeTo(input);
  console.log('input', input);
  const bCat = await checkBCat(input);
  let foundCats = [];
  try {
    const response = await axios.get(_url + input);
    if (bCat) return [{key:'toBuy', title:'no-title', res: getResources(response)}];
    generalResponse = response;
    const content = response.data.items.map(r => r.title + ' ' + r.snippet).join(' ');
    const document = { content, type: 'PLAIN_TEXT' };
    const [result] = await client.classifyText({ document });
    console.log('result', result);
    if (!result.categories.length) return await getAllCategoryAPIrace(input);
    foundCats = checkToLocalCats(response, result.categories[0]);
    if (foundCats.length > 0) return foundCats;
    else return await getAllCategoryAPIrace(input);
  } catch (error) {
    console.log('API Error:', error);
    return null;
  }
};

const checkToLocalCats = (response, result, misc = false) => {
  let foundCats = [];
  const returnedCat = result.name.toLowerCase();
  Object.keys(masterCategories).map(key => {
    const currentTags = masterCategories[key].tags;
    let found = currentTags.some(t => returnedCat.includes(t));
    if (found) foundCats.push({ key, title: masterCategories[key].title, res: getResources(response) });
  });

  if (misc)
    foundCats =  !foundCats.length ? [{key:'misc', title: result.name, res: getResources(response)}] : foundCats;
  return foundCats;
};

const removeTo = (data) => {
  if (data.trim().substr(0, 3).toLowerCase() === 'to ') data = data.slice(3);
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
const getFirstVerb = async (text) => {
  try {
    const aT = await analyzeText(text);
    const verbs = aT.phraseAnalyzed.filter(t => t.tag === 'VERB')
    const res = !verbs.length ? null : verbs[0].text;
    return res;
  } catch (err) {
    console.error('Error get First Verb:', err);
  }
};
const isVerb = async (text, verb) => {
  try {
    const aT = await analyzeText(text);
    console.log('aT', aT);
    const verbs = aT.phraseAnalyzed.filter(t => t.tag === 'VERB')
    if (!verbs.length) return false;
    // return verbs.length > 0 && verbs[0].text.toUpperCase() === verb.toUpperCase();
    console.log('1 verb', verbs[0].text.toUpperCase());
    return verb.toUpperCase().includes(verbs[0].text.toUpperCase());
  } catch (err) {
    console.error('Error is Verb:', err);
  }
};
const checkBCat = async(text) => {
  const buyingVerbs = ['buy', 'purchase', 'acquisition', 'invest', 'acquire', 'acquiring', 'buying', 'purchasing', 'investment', 'investing'];
  const firstVerb = await getFirstVerb(text);
  return buyingVerbs.some(v => {
    return v.includes(firstVerb)
  });
};

const getResources = response => {
  const res = response.data.items.map(r => {
    const result = { title: r.title, link:r.link, snippet:r.snippet };
    return result;
  });
  return res;
}

// (async () => {
//   try {
//     const cat = await getCategoryAPI(phrase);
//     console.log(cat);
//   } catch (e) {
//     console.error('Error:', e);
//   }
// })();


module.exports = getCategoryAPI;

