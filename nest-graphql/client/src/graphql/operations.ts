import { gql } from '@apollo/client';

export const GET_ALL_MOVIES = gql`
  query GetAllMovies {
    getAllMovies {
      id
      title
      description
      createdAt
      updatedAt
      movieComment
    }
  }
`;

export const CREATE_MOVIE = gql`
  mutation CreateMovie($input: MovieInputCreate!) {
    createMovie(movieInputCreate: $input) {
      id
      title
      description
    }
  }
`; 