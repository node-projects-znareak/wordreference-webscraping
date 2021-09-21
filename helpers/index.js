const chalk = require("chalk");
const figlet = require("figlet");
const Spinner = require("cli-spinner").Spinner;
const axios = require("axios").default;
const API_URL = "https://www.wordreference.com/es/translation.asp?tranword=";

const error = (msj) => {
  console.error(chalk.red.bold(`❌ ${msj}.`));
};

const welcome = (word) => {
  const LINES = 100;

  console.log(
    chalk.yellow(
      figlet.textSync("WordReference", {
        horizontalLayout: "full",
      })
    )
  );
  console.log("-".repeat(LINES));
  console.log(
    "|\t\t\tWeb Scraping API for word referecen page.",
    " ".repeat(33) + "|"
  );

  console.log("-".repeat(LINES), "\n");
  console.log(`\tPrincipal translations for: ${word}\n`);
};

const spinner = () => {
  const _spinner = new Spinner("Searching... %s ");
  _spinner.setSpinnerString("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏");
  return _spinner;
};

const fetchWord = async (word) => {
  const html = await axios.get(`${API_URL}${word.toLocaleLowerCase()}`);
  return html.data.replace(/(\r\n|\n|\r)/gm, "");
};

const getTooltipTitle = (domNode) => {
  const tooltip = domNode?.querySelector("em.tooltip");
  tooltip?.querySelector("a")?.remove();
  tooltip?.querySelector("span")?.remove(); // this is the tooltip description
  return tooltip?.textContent;
};

const removeTooltip = (domNode) => {
  domNode?.querySelector("em")?.remove();
  domNode?.querySelector("a")?.remove();
  return domNode?.textContent?.trim();
};

const getWordType = (word) => {
  const type = getTooltipTitle(word?.querySelector("td.FrWrd"));
  return type;
};

const filterWordsByType = (tableRows, wordType) => {
  const tableRow = tableRows?.filter((row) => {
    return getWordType(row) === wordType;
  });
  return tableRow;
};

const formatTranslateWord = (word) => {
  const translatedWord = removeTooltip(word?.querySelector("td.ToWrd"));
  const contextWord = word
    ?.querySelector("td:nth-child(2)")
    ?.textContent?.trim();
  return {
    translate: translatedWord,
    use: contextWord,
    type: getTooltipTitle(word),
  };
};

const showTranslationsTable = (tableRows, table) => {
  let currentType;
  const allWordsTypes = {};
  const allWords = tableRows?.map(formatTranslateWord);

  for (const word of allWords) {
    if (!word.type && !word.translate) {
      const wordType = allWordsTypes[currentType].examples;
      wordType
        ? wordType.push(word.use)
        : (allWordsTypes[currentType].examples = [word.use]);
    } else if (word.translate !== undefined && word.use !== undefined) {
      if (word.type) currentType = word.type;

      const wordType = allWordsTypes[currentType];
      wordType ? wordType.push(word) : (allWordsTypes[currentType] = [word]);
    }
  }

  for (const [type, words] of Object.entries(allWordsTypes)) {
    console.log("\n" + chalk.cyanBright.bold(type) + "\n");
    const translations = words
      ?.filter((word) => !!word.translate)
      ?.map((word) => chalk.yellowBright(word.translate))
      ?.join("\n");

    console.log(translations);
    console.log("\n" + chalk.magentaBright("Examples: "));
    console.log(
      words?.examples
        ?.map((ex, i) => {
          if (i % 2 == !0) return ex + "\n";
          return ex;
        })
        ?.join("\n")
    );
    console.log("-".repeat(80));
  }
};

module.exports = {
  error,
  welcome,
  spinner: spinner(),
  fetchWord,
  getTooltipTitle,
  removeTooltip,
  filterWordsByType,
  showTranslationsTable,
};
