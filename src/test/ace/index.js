/* eslint-disable */
const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));

app.get("/ace/hello", (req, res) => {
  res.send({ data: "Hello" });
});

app.listen(process.env.PORT || 8080, () =>
  console.log(`Listening ace on ${process.env.PORT || 8080}`)
);
