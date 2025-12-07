import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

/**
 * Guard pour vérifier si l'utilisateur est un administrateur
 * Utilisation: @UseGuards(AuthGuard('jwt'), AdminGuard)
 * 
 * Pour l'instant, cette implémentation vérifie si l'email de l'utilisateur
 * est dans la liste des admins définie dans les variables d'environnement.
 * 
 * TODO: Ajouter un champ 'role' dans la table User pour une gestion plus robuste
 */
@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.userId) {
            throw new ForbiddenException('User not authenticated');
        }

        // Récupérer l'utilisateur complet depuis la DB
        const fullUser = await this.prisma.user.findUnique({
            where: { id: user.userId },
            select: { email: true },
        });

        if (!fullUser) {
            throw new ForbiddenException('User not found');
        }

        // Vérifier si l'email est dans la liste des admins
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];

        if (!adminEmails.includes(fullUser.email)) {
            throw new ForbiddenException('This action requires administrator privileges');
        }

        return true;
    }
}
