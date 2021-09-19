const express = require("express");
const { success } = require("../helpers/httpResponses");
const yup = require("yup");
const validate = require("../helpers/validations/validate");
const router = express.Router();

const schemaWord = yup.object({
  query: yup.object({
    word: yup
      .string()
      .max(50, "El término debe tener máximo 50 carácteres")
      .required("El término a traducir es obligatorio"),
  }),
});

router.get("/translate", validate(schemaWord), (req, res) => {
  const word = req.query.word;

  success(res, word);
});

module.exports = router;
