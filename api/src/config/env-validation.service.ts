import { Injectable, Logger } from '@nestjs/common';

/**
 * Service de validation des variables d'environnement
 * Vérifie que toutes les variables requises sont définies au démarrage de l'application
 */
@Injectable()
export class EnvValidationService {
    private readonly logger = new Logger(EnvValidationService.name);

    /**
     * Valide que toutes les variables d'environnement requises sont définies
     * @throws Error si une variable requise est manquante
     */
    validateEnvironment(): void {
        const requiredVars = {
            // Base de données
            'DATABASE_URL': process.env.DATABASE_URL,

            // JWT
            'JWT_SECRET': process.env.JWT_SECRET,

            // Stripe
            'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
            'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
            'STRIPE_MONTHLY_PRICE_ID': process.env.STRIPE_MONTHLY_PRICE_ID,
            'STRIPE_YEARLY_PRICE_ID': process.env.STRIPE_YEARLY_PRICE_ID,

            // Frontend URL
            'FRONTEND_URL': process.env.FRONTEND_URL,
        };

        const missingVars: string[] = [];
        const invalidVars: string[] = [];

        // Vérifier les variables manquantes
        Object.entries(requiredVars).forEach(([key, value]) => {
            if (!value || value.trim() === '') {
                missingVars.push(key);
            }
        });

        // Vérifier les IDs de prix Stripe (ne doivent pas contenir 'YOUR_')
        if (process.env.STRIPE_MONTHLY_PRICE_ID?.includes('YOUR_')) {
            invalidVars.push('STRIPE_MONTHLY_PRICE_ID (contains placeholder value)');
        }
        if (process.env.STRIPE_YEARLY_PRICE_ID?.includes('YOUR_')) {
            invalidVars.push('STRIPE_YEARLY_PRICE_ID (contains placeholder value)');
        }

        // Logger et lever une erreur si des variables sont manquantes ou invalides
        if (missingVars.length > 0 || invalidVars.length > 0) {
            if (missingVars.length > 0) {
                this.logger.error('❌ Missing required environment variables:');
                missingVars.forEach(varName => this.logger.error(`   - ${varName}`));
            }

            if (invalidVars.length > 0) {
                this.logger.error('❌ Invalid environment variables:');
                invalidVars.forEach(varName => this.logger.error(`   - ${varName}`));
            }

            throw new Error(
                'Environment validation failed. Please check your .env file and ensure all required variables are set correctly.'
            );
        }

        this.logger.log('✅ All required environment variables are properly configured');
    }

    /**
     * Valide les variables d'environnement optionnelles et affiche des warnings
     */
    validateOptionalEnvironment(): void {
        const optionalVars = {
            'ADMIN_EMAILS': process.env.ADMIN_EMAILS,
            'RATE_LIMIT_TTL': process.env.RATE_LIMIT_TTL,
            'RATE_LIMIT_MAX': process.env.RATE_LIMIT_MAX,
        };

        const missingOptional: string[] = [];

        Object.entries(optionalVars).forEach(([key, value]) => {
            if (!value || value.trim() === '') {
                missingOptional.push(key);
            }
        });

        if (missingOptional.length > 0) {
            this.logger.warn('⚠️  Optional environment variables not set (using defaults):');
            missingOptional.forEach(varName => this.logger.warn(`   - ${varName}`));
        }
    }
}
