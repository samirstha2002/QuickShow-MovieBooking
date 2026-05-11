import express from "express";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
const port = 3000;

//Middleware
app.use(express.json());
app.use(cors());

//Api Routes
app.get("/", (req, res) => res.send("Server is Live"));

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`),
);
