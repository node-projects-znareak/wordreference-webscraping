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
  // console.log(`\tWORD TO TRANSLATE: ${word}\n`);
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
  return tableRows?.filter((row) => getWordType(row) === wordType);
};

const formatTranslateWord = (word) => {
  const translatedWord = removeTooltip(word?.querySelector("td.ToWrd"));
  const contextWord = word
    .querySelector("td:nth-child(2)")
    ?.textContent?.trim();
  return {
    translate: translatedWord,
    use: contextWord,
  };
};

const showTable = (title, data) => {
  if (data?.length) {
    console.log("\n" + chalk.cyanBright.bold(title));
    console.table(data);
  }
};

const showTranslationTable = (title, words) => {
  const result = [];
  for (const word of words) {
    result.push(formatTranslateWord(word));
  }
  showTable(title, result);
};

const formatWords = (words) => {
  const result = [];
  for (const word of words) {
    result.push(formatTranslateWord(word));
  }
  return result;
};

const showTranslationsTable = (tableRows) => {
  const prepositionWords = filterWordsByType(tableRows, "prep");
  const conjuntionWords = filterWordsByType(tableRows, "conj");
  const adverbWords = filterWordsByType(tableRows, "adv");
  const expressions = filterWordsByType(tableRows, "v expr");
  const nouns = filterWordsByType(tableRows, "n");
  const verbPhrasal = filterWordsByType(tableRows, "vtr phrasal sep");

  showTranslationTable("Nouns", nouns);
  showTranslationTable("Verb, Transitive Phrasal Sep", verbPhrasal);
  showTranslationTable("Prepositions", prepositionWords);
  showTranslationTable("Conjuntions", conjuntionWords);
  showTranslationTable("Adverbs", adverbWords);
  showTranslationTable("Verbal Expressions", expressions);
};

const getTranslationsWords = (tableRows) => {
  const prepositionWords = formatWords(filterWordsByType(tableRows, "prep"));
  const conjuntionWords = formatWords(filterWordsByType(tableRows, "conj"));
  const adverbWords = formatWords(filterWordsByType(tableRows, "adv"));
  const expressions = formatWords(filterWordsByType(tableRows, "v expr"));
  const nouns = formatWords(filterWordsByType(tableRows, "n"));
  const json = {};
  const verbPhrasal = formatWords(
    filterWordsByType(tableRows, "vtr phrasal sep")
  );
  if (nouns.length) json.nouns = nouns;
  if (verbPhrasal.length) json.verbPhrasal = verbPhrasal;
  if (prepositionWords.length) json.prepositions = prepositionWords;
  if (conjuntionWords.length) json.conjuntion = conjuntionWords;
  if (adverbWords.length) json.adverb = adverbWords;
  if (expressions.length) json.expressions = expressions;

  return json;
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
  getTranslationsWords,
};
