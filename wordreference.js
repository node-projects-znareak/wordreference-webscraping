const chalk = require("chalk");
const figlet = require("figlet");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {
  error,
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
  console.clear();
  spinner.start();
  try {
    const html = await fetchWord(word);
    const dom = new JSDOM(html);
    const table = dom.window.document.querySelector("table.WRD tbody");
    const tableRows = [
      ...table.querySelectorAll("tr.even, table.WRD tbody tr.odd"),
    ];
    console.clear();
    console.log(
      chalk.yellow(
        figlet.textSync("WordReference", {
          horizontalLayout: "full",
        })
      )
    );
    console.log("-".repeat(100));
    console.log(
      "|\t\t\tWeb Scraping API for word referecen page.",
      " ".repeat(33) + "|"
    );

    console.log("-".repeat(100), "\n");
    console.log(`\tWORD TO TRANSLATE: ${word}\n`);

    showTranslationsTable(tableRows);
  } catch (err) {
    error(err);
  } finally {
    spinner.stop();
  }
};

main();
