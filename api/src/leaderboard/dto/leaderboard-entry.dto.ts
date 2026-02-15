export class LeaderboardEntryDto {
  userId: number;
  userName: string;
  profilePictureUrl?: string | null; // Accepte null de Prisma
  rank: number;
  value: number; // La valeur du critère (sessions, streak, level, etc.)
  level?: number; // Niveau de l'utilisateur (pour affichage additionnel)
  isCurrentUser: boolean; // Pour mettre en évidence l'utilisateur connecté
}
