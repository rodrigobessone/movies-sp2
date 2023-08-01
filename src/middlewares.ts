import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import format from "pg-format";

const verifyMoviesByID = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {

  try {
    const idMovie: number = parseInt(req.params.id, 10);
  
    const queryFormatIdVerify: string = format(`
      SELECT * FROM movies
      WHERE id = %L`, idMovie);
  
      const resultChecking = await client.query(queryFormatIdVerify);

    if (resultChecking.rowCount === 0) {
      return res.status(404).json({
        message: 'Movie not found!',
      });
    }
    return next();
  } catch (err) {
    return res.status(500).json({
      message: 'Error while checking the movie',
    });
  }
};

const verifyMoviesByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const findNameQuery = format("SELECT id FROM movies WHERE name = %L", name);

    const queryResult = await client.query(findNameQuery);
    if(queryResult.rows.length > 0){
      return res.status(409).json({ message: "Movie name already exists!" });
    }
    return next();
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
};

export { verifyMoviesByID, verifyMoviesByName };
