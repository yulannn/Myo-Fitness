import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Module de logging professionnel avec Pino
 * 
 * Fonctionnalités:
 * - Logs structurés JSON (production) ou pretty (dev)
 * - Request ID automatique pour traçabilité
 * - Logging HTTP automatique (requêtes + réponses)
 * - Redaction des données sensibles (password, tokens)
 * - Compatible agrégation de logs (Loki, ELK, Datadog)
 * - Performance optimale (Pino est 5x plus rapide que Winston)
 */
@Module({
    imports: [
        PinoLoggerModule.forRoot({
            pinoHttp: {
                // Configuration différente selon l'environnement
                transport: process.env.NODE_ENV !== 'production'
                    ? {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            levelFirst: true,
                            translateTime: 'SYS:standard',
                            ignore: 'pid,hostname',
                            singleLine: false,
                            messageFormat: '{req.method} {req.url} - {msg}',
                        },
                    }
                    : undefined, // En prod, logs JSON sans transport (plus performant)

                // Niveau de log selon environnement
                level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

                // Formatage des logs
                formatters: {
                    level: (label: string) => {
                        return { level: label };
                    },
                },

                // Redaction des données sensibles
                redact: {
                    paths: [
                        'req.headers.authorization',
                        'req.headers.cookie',
                        'req.body.password',
                        'req.body.newPassword',
                        'req.body.oldPassword',
                        'req.body.token',
                        'req.body.refreshToken',
                        'req.body.accessToken',
                        'res.headers["set-cookie"]',
                    ],
                    remove: true,
                },

                // Personnalisation des logs de requêtes HTTP
                customProps: (req: Request, res: Response) => {
                    return {
                        context: 'HTTP',
                    };
                },

                // Génération automatique du Request ID
                genReqId: (req: Request) => {
                    // Utiliser l'ID existant ou en générer un nouveau
                    return (req.headers['x-request-id'] as string) || uuidv4();
                },

                // Sérialisation custom pour les requêtes
                serializers: {
                    req: (req: any) => ({
                        id: req.id,
                        method: req.method,
                        url: req.url,
                        query: req.query,
                        params: req.params,
                        // Ne pas logger le body complet en production (peut être volumineux)
                        // body: process.env.NODE_ENV !== 'production' ? req.raw.body : undefined,
                        ip: req.headers['x-forwarded-for'] || req.raw.ip,
                        userAgent: req.headers['user-agent'],
                    }),
                    res: (res: any) => ({
                        statusCode: res.statusCode,
                    }),
                    err: (err: any) => ({
                        type: err.type,
                        message: err.message,
                        stack: err.stack,
                    }),
                },

                // Logger toutes les requêtes (sauf health checks)
                autoLogging: {
                    ignore: (req: Request) => {
                        // Toujours ignorer les health checks
                        const ignoredPaths = ['/health', '/metrics'];
                        if (ignoredPaths.some(path => req.url?.startsWith(path))) {
                            return true;
                        }

                        // En développement, ignorer les requêtes GET réussies (304, 200)
                        // pour réduire le bruit tout en gardant les erreurs et mutations
                        if (process.env.NODE_ENV !== 'production') {
                            // Garder seulement : POST, PUT, DELETE, PATCH, et erreurs
                            const isReadOperation = req.method === 'GET' || req.method === 'HEAD';
                            return isReadOperation; // Ignorer les GET en dev
                        }

                        return false; // En prod, logger tout
                    },
                },

                // Timestamps au format ISO
                timestamp: () => `,"time":"${new Date().toISOString()}"`,
            },
        }),
    ],
    exports: [PinoLoggerModule],
})
export class LoggerModule { }
