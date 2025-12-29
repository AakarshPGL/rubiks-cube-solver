import express from "express";
import { solveCubeAPI } from "./api/solvecube.js";
import multer from "multer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const upload =multer({
    storage:multer.memoryStorage()
});

app.post(
    "/api/solve",
    upload.fields([
    { name: "Up" },
    { name: "Right" },
    { name: "Front" },
    { name: "Down" },
    { name: "Left" },
    { name: "Back" }
    ]),
    solveCubeAPI
);



app.listen(5001, () => {
    console.log("Server is running on port 5001");
});