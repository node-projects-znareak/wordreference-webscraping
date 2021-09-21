const chalk = require("chalk");
var uuid = require("uuid");
const fs = require("fs");
const inquirer = require("inquirer");
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

const spinner = (txt) => {
  const _spinner = new Spinner(`${txt}... %s `);
  _spinner.setSpinnerString("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏");
  return _spinner;
};

const fetchWord = async (word) => {
  const html = await axios.get(`${API_URL}${word.toLocaleLowerCase()}`);
  return html.data.replace(/(\r\n|\n|\r)/gm, "");
};

const getTooltipTitle = (domNode) => {
  const tooltip = domNode?.querySelector("em.tooltip");
  const desc = tooltip?.querySelector("span")?.querySelector("i")?.textContent;
  tooltip?.querySelector("a")?.remove();
  tooltip?.querySelector("span")?.remove(); // this is the tooltip description
  return desc ? `${tooltip?.textContent} (${desc})` : tooltip?.textContent;
};

const removeTooltip = (domNode) => {
  domNode?.querySelector("em")?.remove();
  domNode?.querySelectorAll("a")?.forEach((a) => a?.remove());
  return domNode?.textContent?.trim();
};

const formatTranslateWord = (word) => {
  const translatedWord = removeTooltip(word?.querySelector("td.ToWrd"));
  const contextWord = word?.querySelector("td:nth-child(2)");
  contextWord?.querySelector("span.tooltip")?.remove();
  const useOrExample = contextWord?.textContent?.trim();

  return {
    translate: translatedWord,
    use: useOrExample,
    type: getTooltipTitle(word),
  };
};

const showTranslationsTable = (tableRows) => {
  let currentType;
  const allWordsTypes = {};
  const allWords = tableRows?.map(formatTranslateWord);
  let newExamples = false;
  for (const word of allWords) {
    if (!word.type && !word.translate) {
      newExamples = true;
      const wordType = allWordsTypes[currentType].examples;
      wordType
        ? wordType.push(word.use)
        : (allWordsTypes[currentType].examples = [word.use]);
    } else if (word.translate !== undefined && word.use !== undefined) {
      // add new break line for each group examples
      // here it use the last
      const lastExamples = allWordsTypes[currentType]?.examples;
      const len = lastExamples?.length;
      if (len && newExamples) {
        newExamples = false;
        lastExamples.push("\n");
      }
      if (word.type) currentType = word.type;

      const wordType = allWordsTypes[currentType];
      wordType ? wordType.push(word) : (allWordsTypes[currentType] = [word]);
    }
  }
  console.log(allWords);
  for (const [type, words] of Object.entries(allWordsTypes)) {
    console.log("\n" + chalk.cyanBright.bold(type) + "\n");
    const translations = words
      ?.filter((word) => !!word.translate)
      ?.map((word) => chalk.yellowBright(word.translate))
      ?.join("\n");

    console.log(translations);
    console.log("\n" + chalk.magentaBright("Examples: "));
    console.log(words?.examples?.join("\n"));
    console.log("-".repeat(80));
  }

  const arrToNativeObject = Object.entries(allWordsTypes)?.map(
    ([type, words]) => {
      return {
        [type]: {
          ...words,
          examples: words.examples,
        },
      };
    }
  );
  return arrToNativeObject;
};

const createTxtFile = (content, ext = "txt") => {
  fs.writeFileSync(`./${uuid.v1()}.${ext}`, JSON.stringify(content, null, 3));
};

const generateFileOutput = async (data) => {
  console.log("\n");
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "format",
      message: "Choose your format output:",
      choices: ["Anki", "JSON", "TXT", "none"],
    },
  ]);

  switch (answer.format.toLowerCase()) {
    case "txt":
      createTxtFile(data);
    case "json":
      createTxtFile(data, "json");
      break;
  }
};

module.exports = {
  error,
  welcome,
  spinner,
  fetchWord,
  getTooltipTitle,
  showTranslationsTable,
  generateFileOutput,
};
