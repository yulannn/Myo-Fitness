import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GroqClient } from '../ia/groq/groq.client';
import {
    ChatMessage,
    ChatResponse,
    UserStats,
    ClearHistoryResponse,
} from './ai-chatbot.types';

@Injectable()
export class AiChatbotService {
    private readonly logger = new Logger(AiChatbotService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly groqClient: GroqClient,
    ) { }

    /**
     * 💬 Envoyer un message au chatbot et obtenir une réponse
     */
    async chat(userId: string, message: string): Promise<ChatResponse> {
        try {
            this.logger.log(`Chat request from user ${userId}: ${message.substring(0, 50)}...`);

            // TODO: Intégrer avec votre service IA (OpenAI, Anthropic, etc.)
            // Pour l'instant, retourne une réponse par défaut
            const assistantMessage = await this.generateResponse(userId, message);

            // Sauvegarder la conversation dans la base de données
            await this.saveMessage(userId, 'user', message);
            await this.saveMessage(userId, 'assistant', assistantMessage);

            return {
                message: assistantMessage,
                timestamp: new Date(),
            };
        } catch (error) {
            this.logger.error(`Error in chat: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 📜 Récupérer l'historique des conversations
     */
    async getHistory(
        userId: string,
        limit: number = 50,
        offset: number = 0,
    ): Promise<ChatMessage[]> {
        try {
            this.logger.log(`Getting chat history for user ${userId} (limit: ${limit}, offset: ${offset})`);

            const messages = await this.prisma.aIChatMessage.findMany({
                where: { userId: parseInt(userId) },
                orderBy: { createdAt: 'asc' },
                skip: offset,
                take: limit,
            });

            return messages.map(msg => ({
                id: msg.id,
                role: msg.role === 'USER' ? 'USER' : 'ASSISTANT',
                content: msg.content,
                createdAt: msg.createdAt,
            }));
        } catch (error) {
            this.logger.error(`Error getting history: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 🗑️ Effacer l'historique des conversations
     */
    async clearHistory(userId: string): Promise<ClearHistoryResponse> {
        try {
            this.logger.log(`Clearing chat history for user ${userId}`);

            const result = await this.prisma.aIChatMessage.deleteMany({
                where: { userId: parseInt(userId) },
            });

            return {
                success: true,
                deletedCount: result.count,
            };
        } catch (error) {
            this.logger.error(`Error clearing history: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 📊 Obtenir les statistiques d'utilisation du chatbot
     */
    async getUserStats(userId: string): Promise<UserStats> {
        try {
            this.logger.log(`Getting stats for user ${userId}`);

            const totalMessages = await this.prisma.aIChatMessage.count({
                where: {
                    userId: parseInt(userId),
                    role: 'USER',
                },
            });

            const lastMessage = await this.prisma.aIChatMessage.findFirst({
                where: { userId: parseInt(userId) },
                orderBy: { createdAt: 'desc' },
            });

            // Compter les conversations (basé sur les gaps de temps > 1h)
            const messages = await this.prisma.aIChatMessage.findMany({
                where: { userId: parseInt(userId) },
                orderBy: { createdAt: 'asc' },
                select: { createdAt: true },
            });

            let totalConversations = 0;
            let lastTime: Date | null = null;

            for (const msg of messages) {
                if (!lastTime || msg.createdAt.getTime() - lastTime.getTime() > 3600000) {
                    totalConversations++;
                }
                lastTime = msg.createdAt;
            }

            return {
                totalMessages,
                totalConversations,
                lastMessageAt: lastMessage?.createdAt || null,
            };
        } catch (error) {
            this.logger.error(`Error getting stats: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 🤖 Génère une réponse du chatbot avec Groq AI
     * @private
     */
    private async generateResponse(userId: string, message: string): Promise<string> {
        try {
            // Récupérer les infos utilisateur pour personnalisation
            const user = await this.prisma.user.findUnique({
                where: { id: parseInt(userId) },
                select: {
                    name: true,
                },
            });

            // Récupérer le profil fitness pour contexte
            const fitnessProfile = await this.prisma.fitnessProfile.findUnique({
                where: { userId: parseInt(userId) },
                select: {
                    experienceLevel: true,
                    goals: true,
                    trainingFrequency: true,
                    weight: true,
                    targetWeight: true,
                },
            });

            // Récupérer l'historique récent pour le contexte (derniers 10 messages)
            const recentHistory = await this.prisma.aIChatMessage.findMany({
                where: { userId: parseInt(userId) },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            // Construire l'historique de conversation pour Groq
            const conversationHistory = recentHistory
                .reverse()
                .map(msg => ({
                    role: msg.role === 'USER' ? 'user' as const : 'assistant' as const,
                    content: msg.content,
                }));

            // Construire le contexte utilisateur
            const userName = user?.name || 'champion';
            const userContext = fitnessProfile
                ? `
🏋️ CONTEXTE UTILISATEUR (${userName}):
- Niveau: ${fitnessProfile.experienceLevel}
- Objectifs: ${fitnessProfile.goals.join(', ')}
- Entraînement: ${fitnessProfile.trainingFrequency}x/semaine
${fitnessProfile.targetWeight ? `- Poids actuel: ${fitnessProfile.weight}kg → Objectif: ${fitnessProfile.targetWeight}kg` : ''}

Utilise ce contexte pour personnaliser tes conseils !
`
                : `L'utilisateur s'appelle ${userName}.`;

            // Système prompt pour définir la personnalité de Myo
            const systemPrompt = `Tu es Myo, l'assistant fitness de Myo Fitness.

${userContext}

⚠️ SÉCURITÉ - RÈGLES ABSOLUES:
- Tu NE réponds QU'aux questions sur le SPORT et la NUTRITION
- AUCUNE recommandation dangereuse (jamais de régimes extrêmes, surmenage, etc.)
- Si question médicale/blessure → "Consulte un professionnel pour ça"
- Si hors-sujet (politique, finance, etc.) → "Je suis spécialisé fitness/nutrition uniquement"
- TOUJOURS privilégier la sécurité de l'utilisateur

🎯 TES RÈGLES ABSOLUES:
- MAX 3-4 PHRASES courtes par réponse
- VA DROIT AU BUT, pas de blabla
- 1 conseil actionnable = 1 réponse
- Utilise des emojis (💪🔥⚡) mais avec modération
- APPELLE l'utilisateur par son prénom (${userName}) quand c'est naturel

💪 TES EXPERTISES:
Programmes, exercices, nutrition, récupération, progression

✅ TON STYLE:
- Ultra concis (comme un SMS motivant)
- Tutoiement
- Directement applicable
- Pas de longs paragraphes

❌ INTERDIT:
- Pavés de texte
- Listes trop longues (max 3 points)
- Répétitions
- Blabla inutile
- Conseils dangereux ou hors-sujet

Sois direct, précis, motivant ET sécuritaire !`;

            // Appel à l'API Groq
            const completion = await this.groqClient['groq'].chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory,
                    { role: 'user', content: message },
                ],
                temperature: 0.5, // Réduit pour plus de concision
                max_tokens: 200, // Réduit de 500 à 200 (économie + concision)
                top_p: 0.8, // Plus stricte
            });

            const aiResponse = completion.choices[0]?.message?.content?.trim();

            if (!aiResponse) {
                throw new Error('Pas de réponse de Groq');
            }

            return aiResponse;
        } catch (error) {
            this.logger.error(`Erreur Groq AI: ${error.message}`, error.stack);

            // Fallback en cas d'erreur API
            return this.getFallbackResponse(message);
        }
    }

    /**
     * 🔄 Réponse de secours si Groq échoue
     * @private
     */
    private getFallbackResponse(message: string): string {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
            return "Salut champion ! 💪 Je suis Myo, ton assistant fitness. Comment puis-je t'aider aujourd'hui ?";
        }

        if (lowerMessage.includes('programme') || lowerMessage.includes('entraînement')) {
            return "Pour ton programme, consulte l'onglet 'Programme' ! Je peux t'aider à l'optimiser. Que veux-tu savoir ? 🏋️";
        }

        if (lowerMessage.includes('nutrition') || lowerMessage.includes('alimentation')) {
            return "Pour la nutrition, tout dépend de tes objectifs ! Prise de masse, sèche ou maintien ? Dis-moi et je t'aide ! 🍗";
        }

        return "Je peux t'aider avec :\n\n💪 Programmes d'entraînement\n🏋️ Conseils sur les exercices\n🍽️ Nutrition\n😴 Récupération\n📈 Progression\n\nPose-moi ta question !";
    }

    /**
     * 💾 Sauvegarde un message dans la base de données
     * @private
     */
    private async saveMessage(
        userId: string,
        role: 'user' | 'assistant',
        content: string,
    ): Promise<void> {
        try {
            await this.prisma.aIChatMessage.create({
                data: {
                    userId: parseInt(userId),
                    role: role === 'user' ? 'USER' : 'ASSISTANT',
                    content,
                },
            });
            this.logger.debug(`Saved ${role} message for user ${userId}`);
        } catch (error) {
            this.logger.error(`Error saving message: ${error.message}`, error.stack);
            throw error;
        }
    }
}
