const chalk = require("chalk");
const figlet = require("figlet");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {
  spinner,
  fetchWord,
  removeTooltip,
  filterWordsByType,
} = require("./helpers");

const word = process.argv[2];
if (!word) {
  throw new Error("You must provider an english word to translate it.");
}

const main = async () => {
  spinner.start();
  const html = await fetchWord(word);
  spinner.stop();
  const dom = new JSDOM(html);
  const table = dom.window.document.querySelector("table.WRD tbody");
  const tableRows = [
    ...table.querySelectorAll("tr.even, table.WRD tbody tr.odd"),
  ];

  const prepositionWords = filterWordsByType(tableRows, "prep");
  const conjuntionWords = filterWordsByType(tableRows, "conj");

  const result = [];
  for (const prepositionWord of prepositionWords) {
    const translatedWord = removeTooltip(
      prepositionWord?.querySelector("td.ToWrd")
    );
    const contextWord =
      prepositionWord.querySelector("td:nth-child(2)")?.textContent;

    result.push({
      isPrep: true,
      translate: translatedWord,
      use: contextWord,
    });
  }

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
  if (prepositionWords.length > 0) {
    console.table(result);
  } else {
    console.log(chalk.red.bold("\t❌ This word isn't a preposition."));
  }
};

main();
