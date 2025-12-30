import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSessionTemplateDto, UpdateSessionTemplateDto } from './dto/session-template.dto';
import { ScheduleSessionDto } from './dto/schedule-session.dto';

@Injectable()
export class SessionTemplateService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 🔍 Récupère un template avec ses exercices
   */
  async getTemplateById(templateId: number, userId: number) {
    const template = await this.prisma.sessionTemplate.findUnique({
      where: { id: templateId },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                bodyWeight: true,
                difficulty: true,
                type: true, // 🆕 Pour distinguer cardio
              },
            },
          },
          orderBy: { orderInSession: 'asc' },
        },
        trainingProgram: {
          include: {
            fitnessProfile: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Session template #${templateId} not found`);
    }

    // Vérifier les permissions
    if (template.trainingProgram.fitnessProfile.userId !== userId) {
      throw new ForbiddenException('You do not have access to this template');
    }

    return template;
  }

  /**
   * ✅ Crée un nouveau template de session
   */
  async createTemplate(dto: CreateSessionTemplateDto, userId: number) {
    // Vérifier que le programme appartient à l'utilisateur
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: dto.programId },
      include: {
        fitnessProfile: { select: { userId: true } },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program.fitnessProfile.userId !== userId) {
      throw new ForbiddenException('You do not have access to this program');
    }

    // Créer le template avec ses exercices
    return this.prisma.sessionTemplate.create({
      data: {
        programId: dto.programId,
        name: dto.name,
        description: dto.description,
        orderInProgram: dto.orderInProgram || 0,
        exercises: {
          create: dto.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            duration: ex.duration, // 🆕 Pour cardio
            notes: ex.notes,
            orderInSession: ex.orderInSession ?? index,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderInSession: 'asc' },
        },
      },
    });
  }

  /**
   * ✏️ Met à jour un template existant
   */
  async updateTemplate(templateId: number, dto: UpdateSessionTemplateDto, userId: number) {
    // Vérifier permissions
    await this.getTemplateById(templateId, userId);

    return this.prisma.$transaction(async (tx) => {
      // Mettre à jour le template
      const updated = await tx.sessionTemplate.update({
        where: { id: templateId },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      // Si on met à jour les exercices, supprimer les anciens et créer les nouveaux
      if (dto.exercises) {
        await tx.exerciseTemplate.deleteMany({
          where: { sessionTemplateId: templateId },
        });

        await tx.exerciseTemplate.createMany({
          data: dto.exercises.map((ex, index) => ({
            sessionTemplateId: templateId,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            duration: ex.duration, // 🆕 Pour cardio
            notes: ex.notes,
            orderInSession: ex.orderInSession ?? index,
          })),
        });
      }

      // Retourner le template mis à jour
      return tx.sessionTemplate.findUnique({
        where: { id: templateId },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { orderInSession: 'asc' },
          },
        },
      });
    });
  }

  /**
   * 🗑️ Supprime un template et ses sessions en attente
   */
  async deleteTemplate(templateId: number, userId: number) {
    await this.getTemplateById(templateId, userId);

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Supprimer les ExerciceSessions des sessions non complétées liées à ce template
      const pendingSessions = await tx.trainingSession.findMany({
        where: {
          sessionTemplateId: templateId,
          completed: false,
        },
        select: { id: true },
      });

      for (const session of pendingSessions) {
        await tx.exerciceSession.deleteMany({
          where: { sessionId: session.id },
        });
      }

      // 2️⃣ Supprimer les sessions non complétées liées à ce template
      await tx.trainingSession.deleteMany({
        where: {
          sessionTemplateId: templateId,
          completed: false,
        },
      });

      // 3️⃣ Supprimer les ExerciseTemplates du template
      await tx.exerciseTemplate.deleteMany({
        where: { sessionTemplateId: templateId },
      });

      // 4️⃣ Supprimer le template lui-même
      return tx.sessionTemplate.delete({
        where: { id: templateId },
      });
    });
  }

  /**
   * 🔍 Méthode privée : Récupère l'instance non complétée d'un template
   * Réutilisée par scheduleFromTemplate ET startFromTemplate
   */
  private async findUncompletedInstance(templateId: number) {
    return this.prisma.trainingSession.findFirst({
      where: {
        sessionTemplateId: templateId,
        completed: false,
      },
      include: {
        exercices: {
          include: {
            exercice: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                bodyWeight: true,
                type: true, // 🆕 Pour distinguer cardio
              },
            },
          },
        },
        sessionTemplate: true,
      },
    });
  }

  /**
   * 📅 Planifie une instance depuis un template (OPTIMISÉ - v2)
   * ✅ Les sessions sont maintenant créées lors de la génération du programme
   * Cette méthode met simplement à jour la date de la session existante
   */
  async scheduleFromTemplate(templateId: number, dto: ScheduleSessionDto, userId: number) {
    const sessionDate = dto.date ? new Date(dto.date) : new Date();

    // 1️⃣ Vérifier permissions
    await this.getTemplateById(templateId, userId);

    // 2️⃣ Chercher la TrainingSession existante non complétée
    const existingInstance = await this.prisma.trainingSession.findFirst({
      where: {
        sessionTemplateId: templateId,
        completed: false,
      },
    });

    // 3️⃣ Si aucune session trouvée, erreur de cohérence
    if (!existingInstance) {
      throw new NotFoundException(
        `No training session found for template #${templateId}. This should have been created during program generation.`
      );
    }

    // 4️⃣ Mettre à jour la date
    return this.prisma.trainingSession.update({
      where: { id: existingInstance.id },
      data: { date: sessionDate },
      include: {
        exercices: {
          include: {
            exercice: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                bodyWeight: true,
                type: true, // 🆕 Pour distinguer cardio
              },
            },
          },
        },
        sessionTemplate: true,
      },
    });
  }

  /**
   * 🚀 Démarre une instance immédiatement depuis un template (OPTIMISÉ - v3 avec Lazy Loading)
   * ✅ Les sessions sont créées lors du programme, MAIS les ExerciceSessions sont créées ICI
   * Cela garantit que les modifications du template sont toujours reflétées
   */
  async startFromTemplate(templateId: number, userId: number) {
    // 1️⃣ Vérifier permissions et récupérer le template
    const template = await this.getTemplateById(templateId, userId);

    return this.prisma.$transaction(async (tx) => {
      // 2️⃣ Chercher la TrainingSession existante non complétée pour ce template
      const existingSession = await tx.trainingSession.findFirst({
        where: {
          sessionTemplateId: templateId,
          status: { not: 'COMPLETED' }, // Toute session non complétée (SCHEDULED, IN_PROGRESS, CANCELLED)
        },
        include: {
          exercices: {
            include: {
              exercice: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  bodyWeight: true,
                  type: true, // 🆕 Pour distinguer cardio
                },
              },
            },
          },
          sessionTemplate: true,
        },
      });

      // 3️⃣ Si aucune session trouvée, c'est un problème de cohérence
      if (!existingSession) {
        throw new NotFoundException(
          `No training session found for template #${templateId}. This should have been created during program generation.`
        );
      }

      // 4️⃣ 🆕 LAZY LOADING : Créer ou recréer les ExerciceSessions depuis le template
      // Cela garantit la synchronisation avec les modifications du template (Problème 1 résolu ✅)

      // Si la session a été annulée ou n'a jamais été démarrée, (re)créer les ExerciceSessions
      if (existingSession.status === 'CANCELLED' || existingSession.status === 'SCHEDULED') {
        // Supprimer les anciennes ExerciceSessions si elles existent
        await tx.exerciceSession.deleteMany({
          where: { sessionId: existingSession.id },
        });

        // Créer les ExerciceSessions depuis le template (toujours à jour)
        for (const exTemplate of template.exercises) {
          // 🆕 Pour les exercices cardio : utiliser duration comme valeur de reps
          const isCardio = exTemplate.exercise?.type === 'CARDIO';
          const repsValue = isCardio
            ? (exTemplate.duration || exTemplate.reps || 15)
            : exTemplate.reps;

          await tx.exerciceSession.create({
            data: {
              sessionId: existingSession.id,
              exerciceId: exTemplate.exerciseId,
              sets: isCardio ? 1 : exTemplate.sets, // Cardio = 1 seule "série"
              reps: repsValue,
              weight: isCardio ? null : (exTemplate.weight || null),
            },
          });
        }

        // Mettre à jour le statut vers IN_PROGRESS
        await tx.trainingSession.update({
          where: { id: existingSession.id },
          data: { status: 'IN_PROGRESS' },
        });
      }

      // 5️⃣ Retourner la session avec les ExerciceSessions fraîchement créées
      return tx.trainingSession.findUnique({
        where: { id: existingSession.id },
        include: {
          exercices: {
            include: {
              exercice: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  bodyWeight: true,
                  type: true, // 🆕 Pour distinguer cardio
                },
              },
            },
          },
          sessionTemplate: true,
        },
      });
    });
  }

  /**
   * 🔧 Helper : Crée une TrainingSession depuis un template
   * @deprecated Cette méthode n'est plus utilisée depuis la v2
   * Les TrainingSessions sont maintenant créées lors de la génération du programme
   * pour éviter les sessions zombies. Conservée pour référence historique.
   */
  private async createInstanceFromTemplate(
    templateId: number,
    programId: number,
    date: Date,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Récupérer le template avec ses exercices
      const template = await tx.sessionTemplate.findUnique({
        where: { id: templateId },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { orderInSession: 'asc' },
          },
        },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      // Créer la TrainingSession
      const session = await tx.trainingSession.create({
        data: {
          programId,
          sessionTemplateId: templateId,
          sessionName: template.name,
          date,
        },
      });

      // Copier les exercices du template vers ExerciceSession
      for (const exTemplate of template.exercises) {
        await tx.exerciceSession.create({
          data: {
            sessionId: session.id,
            exerciceId: exTemplate.exerciseId,
            sets: exTemplate.sets,
            reps: exTemplate.reps,
            weight: exTemplate.weight || null,
          },
        });
      }

      // Retourner la session complète
      return tx.trainingSession.findUnique({
        where: { id: session.id },
        include: {
          exercices: {
            include: {
              exercice: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  bodyWeight: true,
                },
              },
            },
          },
          sessionTemplate: true,
        },
      });
    });
  }
}
