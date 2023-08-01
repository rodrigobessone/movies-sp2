import { Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { ListMovie } from "./interfaces";
import format from "pg-format";

const allMovies = async (req: Request, res: Response): Promise<Response> => {
  const { category } = req.query;

  try {
    const queryCategory = 'SELECT DISTINCT category FROM movies';
    const queryCategoryResult = await client.query(queryCategory);
    const categories = queryCategoryResult.rows.map((movie) => movie.category);

    let selectedMovies = 'SELECT * FROM movies';
    if (category && categories.includes(category as string)) {
      const formattedCategory = format('SELECT * FROM movies WHERE category = %L', category);
      selectedMovies = formattedCategory;
    }

    const queryResult = await client.query(selectedMovies);
    const movies = queryResult.rows;

    return res.json(movies);
  } catch (error) {
    return res.status(500).json({
      message: 'Error while fetching movies',
    });
  }
};

const insertMovies = async (req: Request, res: Response): Promise<Response> => {
  try {
    const newMovie: ListMovie = req.body;

    const queryString: string = format(`
      INSERT INTO movies(name, category, duration, price)
      VALUES (%L, %L, %L, %L)
      RETURNING *;
    `, newMovie.name, newMovie.category, newMovie.duration, newMovie.price);

    const queryConfig: QueryConfig = {
      text: queryString,
    };

    const queryResult = await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes('duplicate key value violates unique constraint')) {
      return res.status(409).json({
        message: 'Name already registered',
      });
    }
    return res.status(500).json({
      message: 'Status server error',
    });
  }
};

const updateMovies = async (req: Request, res: Response): Promise<Response> => {
  const idMovie = parseInt(req.params.id, 10);

  const { name, category, duration, price } = req.body;

  const queryString = format(`
    UPDATE movies
    SET
      name = COALESCE(%L, name),
      category = COALESCE(%L, category),
      duration = COALESCE(%L, duration),
      price = COALESCE(%L, price)
    WHERE
      id = %L
    RETURNING *;
  `, name, category, duration, price, idMovie);

  const queryConfig: QueryConfig = {
    text: queryString,
  };

  const queryResult = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows[0]);
};

const deleteMovies = async (req: Request, res: Response): Promise<Response> => {
  const idMovie: number = parseInt(req.params.id, 10);

  const queryString: string = format(`
    DELETE FROM movies
    WHERE id = %L
  `, idMovie);

  const queryConfig: QueryConfig = {
    text: queryString,
  };

  await client.query(queryConfig);
  return res.status(204).send();
};

const getMoviesByID = async (req: Request, res: Response): Promise<Response> => {
  try {
    const idMovie: number = parseInt(req.params.id, 10);

    const queryFormatIdVerify: string = format(`
      SELECT * FROM movies
      WHERE id = %L
    `, idMovie);

    const resultChecking = await client.query(queryFormatIdVerify);

    if (resultChecking.rowCount === 0) {
      return res.status(404).json({
        message: 'Movie not found!',
      });
    }

    return res.status(200).json(resultChecking.rows[0]);
  } catch (error) {
    return res.status(500).json({
      message: 'Error while checking the movie',
    });
  }
};

export { insertMovies, allMovies, deleteMovies, updateMovies, getMoviesByID };
