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
   * 🗑️ Supprime un template
   */
  async deleteTemplate(templateId: number, userId: number) {
    await this.getTemplateById(templateId, userId);

    // Vérifier qu'il n'y a pas de sessions non complétées basées sur ce template
    const pendingSessions = await this.prisma.trainingSession.count({
      where: {
        sessionTemplateId: templateId,
        completed: false,
      },
    });

    if (pendingSessions > 0) {
      throw new BadRequestException(
        `Cannot delete template: ${pendingSessions} pending session(s) are based on it. Complete or delete them first.`,
      );
    }

    return this.prisma.sessionTemplate.delete({
      where: { id: templateId },
    });
  }

  /**
   * 📅 Planifie une instance depuis un template
   */
  async scheduleFromTemplate(templateId: number, dto: ScheduleSessionDto, userId: number) {
    const template = await this.getTemplateById(templateId, userId);

    const sessionDate = dto.date ? new Date(dto.date) : new Date();

    return this.createInstanceFromTemplate(template.id, template.programId, sessionDate);
  }

  /**
   * 🚀 Démarre une instance immédiatement depuis un template
   */
  async startFromTemplate(templateId: number, userId: number) {
    const template = await this.getTemplateById(templateId, userId);
    return this.createInstanceFromTemplate(template.id, template.programId, new Date());
  }

  /**
   * 🔧 Helper : Crée une TrainingSession depuis un template
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
