/* eslint-disable */
const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("tiny"));

app.get("/doublef/hello", (req, res) => {
  res.send({ data: "Hello" });
});

app.listen(process.env.PORT || 8080, () =>
  console.log(`Listening on ${process.env.PORT || 8080}`)
);
