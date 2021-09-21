const chalk = require("chalk");
const {
  selector,
  removeSelectorNode,
  removeSelectorNodes,
  remove,
  selectorAll,
  text,
} = require("./utils");
var uuid = require("uuid");
const fs = require("fs");
const AnkiExport = require("anki-apkg-export").default;
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
  const tooltip = selector(domNode, "em.tooltip");
  const tooltipDescription = text(selector(selector(tooltip, "span"), "i"));
  removeSelectorNodes(tooltip, "a", "span"); // this is the tooltip description
  return tooltipDescription
    ? `${text(tooltip)} (${tooltipDescription})`
    : text(tooltip);
};

const removeTooltip = (domNode) => {
  removeSelectorNode(domNode, "em");
  selectorAll(domNode, "a")?.forEach(remove);
  return text(domNode)?.trim();
};

const formatTranslateWord = (word) => {
  const translatedWord = removeTooltip(selector(word, "td.ToWrd"));
  const contextWord = selector(word, "td:nth-child(2)");
  removeSelectorNode(contextWord, "span.tooltip");
  // this might be an example or the word use in the sentences
  const useOrExample = text(contextWord)?.trim();

  return {
    translate: translatedWord,
    use: useOrExample,
    type: getTooltipTitle(word),
  };
};

const showTranslationsTable = (tableRows) => {
  let currentWordType;
  const allTranslations = {};
  const allTranslationsHtml = tableRows?.map(formatTranslateWord);
  let newExamples = false;

  for (const word of allTranslationsHtml) {
    if (!word.type && !word.translate) {
      newExamples = true;
      const wordType = allTranslations[currentWordType].examples;
      if (wordType) {
        wordType.push(word.use);
      } else {
        allTranslations[currentWordType].examples = [word.use];
      }
    } else if (word.translate !== undefined && word.use !== undefined) {
      // add new break line for each group examples
      const lastExamples = allTranslations[currentWordType]?.examples;
      if (lastExamples?.length && newExamples) {
        newExamples = false;
        lastExamples.push("\n");
      }
      if (word.type) currentWordType = word.type;

      const wordType = allTranslations[currentWordType];
      if (wordType) {
        wordType.push(word);
      } else {
        allTranslations[currentWordType] = [word];
      }
    }
  }

  for (const [type, words] of Object.entries(allTranslations)) {
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

  const arrToNativeObject = Object.entries(allTranslations)?.map(
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

const createAnkiCard = async (word, content) => {
  console.clear();
  let finalTranslation = [];
  //
  console.log("OBJECT ENTIRES");
  for (const word of content) {
    // all diferents words type (nouns, adv, adj, expr, articles)
    for (const translations of Object.values(word)) {
      // getTranslationText is the js object { translate, use, type }
      const getTranslationText = Object.values(translations)
        .map((t) => t.translate)
        .filter((e) => !!e); // remove undefined translations
      finalTranslation.push(...getTranslationText);
    }
  }
  finalTranslation = [...new Set(finalTranslation)];
  console.log(finalTranslation);

  // anki flashcard creation
  const apkg = new AnkiExport("Vocabulario Inglés");
  apkg.addCard(`Traducciones para: ${word}`, finalTranslation.join(", "));
  const dataBytes = await apkg.save();
  fs.writeFileSync(`./${uuid.v1()}.apkg`, dataBytes, "binary");
  console.log(`Anki flashcard created!`);
};

const createTxtFile = (content, ext = "txt") => {
  fs.writeFileSync(`./${uuid.v1()}.${ext}`, JSON.stringify(content, null, 3));
};

const generateFileOutput = async (word, data) => {
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
    case "json":
      createTxtFile(data, "json");
      break;
    case "anki":
      createAnkiCard(word, data);
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
