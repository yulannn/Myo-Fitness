import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGymDto, FindOrCreateGymDto } from './dto/gym.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class GymService {
    private readonly logger = new Logger(GymService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Trouve une salle par son OSM ID ou la crée si elle n'existe pas
     * Utilisé uniquement si un utilisateur ou une séance s'y attache
     */
    async findOrCreate(dto: FindOrCreateGymDto) {
        // Vérifier si la salle existe déjà
        let gym = await this.prisma.gym.findUnique({
            where: { osmId: dto.osmId },
        });

        // Si elle n'existe pas, la créer
        if (!gym) {
            gym = await this.prisma.gym.create({
                data: {
                    osmId: dto.osmId,
                    name: dto.name,
                    address: dto.address,
                    city: dto.city,
                    lat: dto.lat,
                    lng: dto.lng,
                },
            });
            this.logger.log(`Gym créée: ${gym.name} (ID: ${gym.id})`);
        }

        return gym;
    }

    /**
     * Récupère les détails d'une salle avec ses membres et séances partagées uniquement
     */
    async getGymDetails(gymId: number) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
            include: {
                // Membres associés à cette salle
                fitnessProfiles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
                // Séances partagées dans cette salle
                SharedSession: {
                    where: {
                        startTime: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Futures ou 7 derniers jours
                    },
                    include: {
                        organizer: {
                            select: {
                                id: true,
                                name: true,
                                profilePictureUrl: true,
                            },
                        },
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profilePictureUrl: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        startTime: 'asc',
                    },
                },
            },
        });

        if (!gym) {
            return null;
        }

        // Structurer les données de manière plus claire
        return {
            ...gym,
            members: gym.fitnessProfiles.map(fp => ({
                id: fp.user.id,
                name: fp.user.name,
                email: fp.user.email,
                profilePictureUrl: fp.user.profilePictureUrl,
                fitnessProfileId: fp.id,
            })),
            sessions: gym.SharedSession.map(sharedSession => ({
                id: sharedSession.id,
                type: 'shared' as const,
                title: sharedSession.title,
                description: sharedSession.description,
                date: sharedSession.startTime,
                startTime: sharedSession.startTime,
                completed: sharedSession.startTime < new Date(),
                maxParticipants: sharedSession.maxParticipants,
                user: {
                    id: sharedSession.organizer.id,
                    name: sharedSession.organizer.name,
                    profilePictureUrl: sharedSession.organizer.profilePictureUrl,
                },
                participantsCount: sharedSession.participants.length,
                participants: sharedSession.participants.map(p => ({
                    id: p.user.id,
                    name: p.user.name,
                    profilePictureUrl: p.user.profilePictureUrl,
                })),
            })),
        };
    }

    /**
     * Récupère une salle par son OSM ID
     */
    async findByOsmId(osmId: string) {
        return this.prisma.gym.findUnique({
            where: { osmId },
        });
    }

    /**
     * Récupère toutes les salles dans un rayon donné
     */
    async findNearby(lat: number, lng: number, radiusKm: number = 5) {
        // Approximation simple pour la distance en degrés
        // 1 degré de latitude ≈ 111 km
        // 1 degré de longitude ≈ 111 km * cos(latitude)
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

        return this.prisma.gym.findMany({
            where: {
                lat: {
                    gte: lat - latDelta,
                    lte: lat + latDelta,
                },
                lng: {
                    gte: lng - lngDelta,
                    lte: lng + lngDelta,
                },
            },
            include: {
                _count: {
                    select: {
                        fitnessProfiles: true,
                        trainingSessions: true,
                    },
                },
            },
        });
    }

    /**
     * Nettoie les salles inutilisées (sans utilisateurs ni séances)
     * Exécuté automatiquement chaque jour à 3h du matin
     */
    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanupUnusedGyms() {
        this.logger.log('Début du nettoyage des salles inutilisées...');

        try {
            // Trouver toutes les salles sans utilisateurs ni séances
            const unusedGyms = await this.prisma.gym.findMany({
                where: {
                    AND: [
                        {
                            fitnessProfiles: {
                                none: {},
                            },
                        },
                        {
                            trainingSessions: {
                                none: {},
                            },
                        },
                    ],
                },
            });

            if (unusedGyms.length === 0) {
                this.logger.log('Aucune salle inutilisée à nettoyer');
                return { deleted: 0 };
            }

            // Supprimer les salles inutilisées
            const result = await this.prisma.gym.deleteMany({
                where: {
                    id: {
                        in: unusedGyms.map(gym => gym.id),
                    },
                },
            });

            this.logger.log(
                `${result.count} salle(s) inutilisée(s) supprimée(s): ${unusedGyms.map(g => g.name).join(', ')}`,
            );

            return { deleted: result.count, gyms: unusedGyms };
        } catch (error) {
            this.logger.error('Erreur lors du nettoyage des salles inutilisées', error);
            throw error;
        }
    }

    /**
     * Méthode manuelle pour nettoyer (pour testing ou admin)
     */
    async manualCleanupUnusedGyms() {
        return this.cleanupUnusedGyms();
    }
}
