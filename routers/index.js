const express = require("express");
const jsdom = require("jsdom");
const yup = require("yup");
const { success } = require("../helpers/httpResponses");
const validate = require("../helpers/validations/validate");
const { fetchWord, getTranslationsWords } = require("../helpers");
const { JSDOM } = jsdom;

const router = express.Router();

const schemaWord = yup.object({
  query: yup.object({
    word: yup
      .string()
      .max(50, "El término debe tener máximo 50 carácteres")
      .required("El término a traducir es obligatorio"),
  }),
});

router.get("/translate", validate(schemaWord), async (req, res) => {
  const word = req.query.word;
  const html = await fetchWord(word);
  const dom = new JSDOM(html);
  const table = dom.window.document.querySelector("table.WRD tbody");
  const tableRows = [
    ...table.querySelectorAll("tr.even, table.WRD tbody tr.odd"),
  ];
  success(res, getTranslationsWords(tableRows));
});

module.exports = router;
