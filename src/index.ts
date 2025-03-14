import express from "express"
import "reflect-metadata";

const app = express();

app.use(express.json());

app.listen(4000, () => {
  console.log("Le serveur est lancé sur le port 4000");
});