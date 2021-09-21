const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {
  error,
  welcome,
  spinner,
  fetchWord,
  showTranslationsTable,
} = require("./helpers");

const word = process.argv[2];
if (!word) {
  error("You must provider an english word to translate it");
  process.exit(1);
}

const main = async () => {
  spinner.start();
  try {
    const html = await fetchWord(word);
    const dom = new JSDOM(html);
    const table = dom.window.document.querySelector("table.WRD tbody");
    const tableRows = [...table.querySelectorAll("tr.even, tr.odd")];

    console.clear();
    welcome(word);

    showTranslationsTable(tableRows, table);
  } catch (err) {
    error(err);
  } finally {
    spinner.stop();
  }
};

main();
