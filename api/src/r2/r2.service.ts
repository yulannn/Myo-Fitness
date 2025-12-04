import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2Service {
    private readonly logger = new Logger(R2Service.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly publicUrl: string;

    constructor(private configService: ConfigService) {
        const endpoint = this.configService.get<string>('R2_ENDPOINT');
        const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('R2_SECRET_KEY');
        const bucketName = this.configService.get<string>('R2_BUCKET');

        // Vérification stricte des variables d'environnement
        if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
            const missing: string[] = [];
            if (!endpoint) missing.push('R2_ENDPOINT');
            if (!accessKeyId) missing.push('R2_ACCESS_KEY');
            if (!secretAccessKey) missing.push('R2_SECRET_KEY');
            if (!bucketName) missing.push('R2_BUCKET');

            throw new Error(
                `R2 configuration is missing: ${missing.join(', ')}. Please check your environment variables.`
            );
        }

        // Assignation après vérification
        this.bucketName = bucketName;

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        // URL publique pour accéder aux fichiers
        const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
        if (accountId) {
            this.publicUrl = `https://${this.bucketName}.${accountId}.r2.cloudflarestorage.com`;
        } else {
            this.publicUrl = endpoint.replace('https://', `https://${this.bucketName}.`);
        }

        this.logger.log('R2 Service initialized successfully');
    }

    /**
     * Génère une URL présignée pour uploader un fichier
     */
    async generatePresignedUploadUrl(
        key: string,
        contentType: string,
        expiresIn: number = 300,
    ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });

            const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
            const publicUrl = `${this.publicUrl}/${key}`;

            this.logger.log(`Generated presigned upload URL for key: ${key}`);

            return {
                uploadUrl,
                key,
                publicUrl,
            };
        } catch (error: any) {
            this.logger.error(`Failed to generate presigned upload URL: ${error.message}`);
            throw error;
        }
    }

    /**
     * Génère une URL présignée pour VOIR/LIRE un fichier (GET)
     * Utilisé pour afficher les images depuis un bucket privé
     * @param key Clé du fichier dans le bucket
     * @param expiresIn Durée de validité en secondes (défaut: 1 heure)
     */
    async generatePresignedViewUrl(
        key: string,
        expiresIn: number = 3600, // 1 heure par défaut
    ): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const viewUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

            this.logger.log(`Generated presigned view URL for key: ${key}`);

            return viewUrl;
        } catch (error: any) {
            this.logger.error(`Failed to generate presigned view URL: ${error.message}`);
            throw error;
        }
    }

    /**
     * Génère une URL présignée de lecture depuis une URL publique stockée
     * @param publicUrl URL publique stockée dans la BDD
     * @param expiresIn Durée de validité en secondes
     */
    async generatePresignedViewUrlFromPublicUrl(
        publicUrl: string,
        expiresIn: number = 3600,
    ): Promise<string | null> {
        const key = this.extractKeyFromUrl(publicUrl);
        if (!key) {
            return null;
        }
        return this.generatePresignedViewUrl(key, expiresIn);
    }

    /**
     * Supprime un fichier du bucket R2
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
            this.logger.log(`Deleted file: ${key}`);
        } catch (error: any) {
            this.logger.error(`Failed to delete file ${key}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Génère un nom de fichier unique pour une photo de profil
     */
    generateProfilePictureKey(userId: number, fileExtension: string): string {
        const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');

        return `profile-pictures/${userId}-${randomName}${fileExtension}`;
    }

    /**
     * Extrait la clé R2 depuis une URL publique
     */
    extractKeyFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            // Enlever le premier slash et nettoyer les doubles slashes
            let pathname = urlObj.pathname.substring(1);
            // Nettoyer les doubles slashes éventuels
            pathname = pathname.replace(/\/+/g, '/');
            // S'assurer que la clé ne commence pas par un slash
            return pathname.startsWith('/') ? pathname.substring(1) : pathname;
        } catch {
            return null;
        }
    }
}
