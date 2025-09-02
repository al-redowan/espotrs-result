
export interface Match {
  id: number;
  name: string;
}

export interface PlayerMatchResult {
    kills: number;
    placement: number;
}

export interface Player {
  id: number;
  name: string;
  matchResults: Record<number, PlayerMatchResult>;
}

export interface RankedPlayer {
  id: number;
  name: string;
  totalKills: number;
  totalPoints: number;
  rank: number;
}

export interface TournamentData {
  title: string;
  date: string;
  players: Player[];
  matches: Match[];
}
