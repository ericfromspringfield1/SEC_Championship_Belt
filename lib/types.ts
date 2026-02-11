export type SeasonTypeNormalized = 'regular' | 'not-regular';

export type Game = {
  id: string;
  date: string;
  season: number;
  seasonType: SeasonTypeNormalized;
  conferenceGame: boolean | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  winnerTeam: string;
  loserTeam: string;
  winnerScore: number;
  loserScore: number;
  source: string;
  sourceIndex: number;
  notes?: string | null;
  noWinnerOrLoser?: boolean;
  titleGame?: boolean;
  homeTeamIsChampion?: boolean;
  awayTeamIsChampion?: boolean;
};

export type MembershipInterval = {
  team: string;
  start_season: number;
  end_season: number | null;
  primaryColor: string;
  secondaryColor: string;
};

export type TitleChange = {
  id: string;
  date: string;
  season: number;
  new_champ: string;
  old_champ: string;
  score: string;
  game_id: string;
  eligible_reason: 'regular_conferenceGame_true' | 'nonregular_both_sec';
};

export type Reign = {
  id: string;
  champ: string;
  start_date: string;
  end_date: string | null;
  length_days: number;
  defenses: number;
  ended_by_team: string | null;
  end_game_id: string | null;
  reign_index_for_team: number;
};
