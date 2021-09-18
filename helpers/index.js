const Spinner = require("cli-spinner").Spinner;
const axios = require("axios").default;

const API_URL = "https://www.wordreference.com/es/translation.asp?tranword=";

const spinner = () => {
  const _spinner = new Spinner("Searching... %s");
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

const filterWordsByType = (tableRows, wordType) => {
  return tableRows?.filter((row) => {
    const isPreposition = getTooltipTitle(row?.querySelector("td.FrWrd"));
    return isPreposition === wordType;
  });
};

module.exports = {
  spinner: spinner(),
  fetchWord,
  getTooltipTitle,
  removeTooltip,
  filterWordsByType,
};
