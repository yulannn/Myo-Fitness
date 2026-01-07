import { LeaderboardEntryDto } from './leaderboard-entry.dto';
import { LeaderboardType } from './leaderboard-type.enum';

export class LeaderboardResponseDto {
    type: LeaderboardType;
    entries: LeaderboardEntryDto[];
    currentUserRank?: number; // Position de l'utilisateur connecté (peut ne pas être dans la liste si hors top)
    totalParticipants: number; // Nombre total d'amis + utilisateur
}
