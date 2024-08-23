import { gqlQuery } from "gql-payload";

// Anilist API Reference https://anilist.github.io/ApiV2-GraphQL-Docs/
const API = {
  BASE: "https://graphql.anilist.co"
};

const Status = {
  AIRING: "RELEASING",
  FINISHED: "FINISHED",
  NOT_YET_RELEASED: "NOT_YET_RELEASED"
};

const Format = {
  TV: "TV",
  TV_SHORT: "TV_SHORT",
  ONA: "ONA",
  OVA: "OVA"
};

const Sort = {
  TRENDING_DESC: "TRENDING_DESC",
  POPULARITY_DESC: "POPULARITY_DESC",
  SEARCH_MATCH: "SEARCH_MATCH",
  START_DATE: "START_DATE",
  START_DATE_DESC: "START_DATE_DESC",
  SCORE_DESC: "SCORE_DESC",
  ROLE: "ROLE",
  RELEVANCE: "RELEVANCE",
  ID: "ID",
  RATING_DESC: "RATING_DESC"
};

const Licensor = {
  CRUNCHYROLL: 5,
  HULU: 7,
  NETFLIX: 10,
  HIDIVE: 20,
  AMAZON: 21
};

const multiQuery = (options) => {
  return {
    operation: `${options.alias}: Page`,
    variables: {
      [`${options.alias}_page`]: { name: "page", type: "Int", value: 1 },
      [`${options.alias}_perPage`]: { name: "perPage", type: "Int", value: options?.perPage || 20 }
    },
    fields: [
      { operation: "media",
        variables: {
          [`${options.alias}_type`]: { name: "type", type: "MediaType", value: "ANIME" },
          [`${options.alias}_format_in`]: { name: "format_in", type: "[MediaFormat]", value: [Format.TV, Format.OVA, Format.ONA, Format.TV_SHORT] },
          [`${options.alias}_sort`]: { name: "sort", type: "[MediaSort]", value: options?.sort },
          [`${options.alias}_status_in`]: { name: "status_in", type: "[MediaStatus]", value: options?.status_in },
          [`${options.alias}_licensedById_in`]: { name: "licensedById_in", type: "[Int]", value: [Licensor.CRUNCHYROLL, Licensor.HULU, Licensor.NETFLIX, Licensor.HIDIVE, Licensor.AMAZON] },
          [`${options.alias}_genre_in`]: { name: "genre_in", type: "[String]", value: options?.genres },
          [`${options.alias}_tag_in`]: { name: "tag_in", type: "[String]", value: options?.tags }
        },
        fields: [
          { operation: "details",
            namedFragment: true
          }
        ]
      }]
  };
};

const getInfo = (options) => {
  const queryNew = multiQuery({ alias: "new", ...options, sort: Sort.START_DATE_DESC, status_in: [Status.AIRING, Status.FINISHED] });
  const queryTopRated = multiQuery({ alias: "top", ...options, sort: Sort.SCORE_DESC });
  const queryTrending = multiQuery({ alias: "trending", ...options, sort: [Sort.TRENDING_DESC, Sort.POPULARITY_DESC] });

  const query = gqlQuery([queryNew, queryTopRated, queryTrending], null, {
    fragment: [{
      name: "details",
      on: "Media",
      fields: [
        "id",
        { title: ["romaji", "english"] },
        { coverImage: ["extraLarge"] },
        "bannerImage",
        { startDate: ["year", "month", "day"] },
        "format",
        "status",
        "averageScore",
        { trailer: ["id", "site"] },
        { nextAiringEpisode: ["airingAt"] }
      ]
    }]
  });
  return JSON.stringify(query);
};

const body = getInfo({ perPage: 6 });

const response = await fetch(API.BASE, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body
});

const { data } = await response.json();

console.info(JSON.stringify(data));