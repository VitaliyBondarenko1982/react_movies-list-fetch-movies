import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from 'react';
import './FindMovie.scss';
import cn from 'classnames';
import { Movie } from '../../types/Movie';
import { MovieCard } from '../MovieCard';
import { getMovie } from '../../api';

const defaultImgUrl =
  'https://via.placeholder.com/360x270.png?text=no%20preview';

interface Props {
  setMovies: Dispatch<SetStateAction<Movie[]>>;
  movies: Movie[];
}

export const FindMovie: React.FC<Props> = ({ setMovies, movies }) => {
  const [query, setQuery] = useState('');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsError(false);
    setQuery(event.target.value);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    setIsLoading(true);

    getMovie(query)
      .then(data => {
        if ('Error' in data) {
          setIsError(true);

          return;
        }

        const { Title, Poster, Plot, imdbID } = data;

        setMovie({
          title: Title,
          description: Plot,
          imgUrl: !Poster || Poster === 'N/A' ? defaultImgUrl : Poster,
          imdbUrl: `https://www.imdb.com/title/${imdbID}`,
          imdbId: imdbID,
        });
      })
      .finally(() => setIsLoading(false));
  };

  const addMovie = () => {
    setMovie(null);
    setQuery('');

    const existedMovie = movies.find(m => m.imdbId === movie?.imdbId);

    if (!movie || existedMovie) {
      return;
    }

    setMovies(prevMovies => [...prevMovies, movie]);
  };

  return (
    <>
      <form className="find-movie" onSubmit={onSubmit}>
        <div className="field">
          <label className="label" htmlFor="movie-title">
            Movie title
          </label>

          <div className="control">
            <input
              data-cy="titleField"
              type="text"
              id="movie-title"
              placeholder="Enter a title to search"
              className={cn('input', { 'is-danger': isError })}
              value={query}
              onChange={onChange}
            />
          </div>

          {isError && (
            <p className="help is-danger" data-cy="errorMessage">
              Can&apos;t find a movie with such a title
            </p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              data-cy="searchButton"
              type="submit"
              className={cn('button is-light', { 'is-loading': isLoading })}
              disabled={!query.trim()}
            >
              Find a movie
            </button>
          </div>

          {movie && (
            <div className="control">
              <button
                data-cy="addButton"
                type="button"
                className="button is-primary"
                onClick={addMovie}
              >
                Add to the list
              </button>
            </div>
          )}
        </div>
      </form>

      {movie && (
        <div className="container" data-cy="previewContainer">
          <h2 className="title">Preview</h2>
          <MovieCard movie={movie} />
        </div>
      )}
    </>
  );
};
