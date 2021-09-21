const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {
  error,
  welcome,
  spinner,
  fetchWord,
  showTranslationsTable,
  generateFileOutput,
} = require("./helpers");

const word = process.argv[2];
if (!word) {
  error("You must provider an english word to translate it");
  process.exit(1);
}

(async () => {
  const searchSpinner = spinner("Searching");
  searchSpinner.start();
  try {
    const html = await fetchWord(word);
    const dom = new JSDOM(html);
    const table = dom.window.document.querySelector("table.WRD tbody");
    const tableRows = [...table.querySelectorAll("tr.even, tr.odd")];

    console.clear();
    welcome(word);
    const data = showTranslationsTable(tableRows, table);
    generateFileOutput(word, data);
  } catch (err) {
    error(err);
  } finally {
    searchSpinner.stop();
  }
})();
