import express, { Application } from "express";
import { connectDB } from "./database";
import { allMovies, deleteMovies, getMoviesByID, insertMovies, updateMovies } from "./logic";
import { verifyMoviesByID, verifyMoviesByName } from "./middlewares";

const PORT = 3000;
const app: Application = express();
app.use(express.json())

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectDB();
});

app.get("/movies", allMovies);
app.get("/movies/:id", getMoviesByID);
app.post("/movies", verifyMoviesByName, insertMovies);
app.patch("/movies/:id",  verifyMoviesByID, verifyMoviesByName, updateMovies);
app.delete("/movies/:id", verifyMoviesByName, verifyMoviesByID, deleteMovies);
