const chalk = require("chalk");
const Spinner = require("cli-spinner").Spinner;
const axios = require("axios").default;
const API_URL = "https://www.wordreference.com/es/translation.asp?tranword=";

const error = (msj) => {
  console.error(chalk.red.bold(`❌ ${msj}.`));
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
  tooltip?.querySelector("span")?.remove(); // this is the tooltip description
  return tooltip?.textContent;
};

const removeTooltip = (domNode) => {
  domNode?.querySelector("em.tooltip")?.remove();
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

const showTranslationsTable = (tableRows) => {
  const prepositionWords = filterWordsByType(tableRows, "prep");
  const conjuntionWords = filterWordsByType(tableRows, "conj");
  const adverbWords = filterWordsByType(tableRows, "adv");
  
  showTranslationTable("Prepositions", prepositionWords);
  showTranslationTable("Conjuntions", conjuntionWords);
  showTranslationTable("Adverbs", adverbWords);
};

module.exports = {
  error,
  spinner: spinner(),
  fetchWord,
  getTooltipTitle,
  removeTooltip,
  filterWordsByType,
  showTranslationsTable,
};
