const text = process.argv[2];
const language = require('@google-cloud/language');
const projectId = 'project-id';
const keyFilename = './Private/midt-548fb3828ba1.json';
const client = new language.LanguageServiceClient({projectId, keyFilename});

async function analizeText(text) {
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };
  try {
    const [result] = await client.analyzeSyntax({document});
    const phraseAnalyzed = [];
    const keyWords = [];
    result.tokens.map((w, ix) => {
      phraseAnalyzed.push({'text': w.text.content, 'tag':w.partOfSpeech.tag, 'mood':w.partOfSpeech.tag});
      if (w.partOfSpeech.tag.toUpperCase() === 'NOUN' || w.partOfSpeech.tag.toUpperCase() === 'VERB')
        keyWords.push({'keyWord': w.text.content});
    });
    const analyze = {phraseAnalyzed, keyWords};
    return analyze;
  } catch (err) {
    console.error('Analyze Text Error:', err);
    return null;
  }
}
module.exports = analizeText;
