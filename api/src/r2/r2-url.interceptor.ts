import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { R2Service } from '../r2/r2.service';

/**
 * Interceptor qui transforme automatiquement les URLs R2 en URLs présignées
 * pour permettre l'affichage d'images depuis un bucket privé
 */
@Injectable()
export class R2UrlInterceptor implements NestInterceptor {
  constructor(private r2Service: R2Service) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (data) => {
        if (!data) return data;

        // Transformer récursivement les URLs R2
        return this.transformR2Urls(data);
      }),
    );
  }

  /**
   * Transforme récursivement les profilePictureUrl en URLs présignées
   */
  private async transformR2Urls(data: any): Promise<any> {
    if (!data) return data;

    // Si c'est un tableau
    if (Array.isArray(data)) {
      return Promise.all(data.map((item) => this.transformR2Urls(item)));
    }

    // Si c'est un objet
    if (typeof data === 'object') {
      const transformed = { ...data };

      // Cas 1: profilePictureUrl existe et est une URL R2
      if (
        transformed.profilePictureUrl &&
        this.isR2Url(transformed.profilePictureUrl)
      ) {
        const presignedUrl =
          await this.r2Service.generatePresignedViewUrlFromPublicUrl(
            transformed.profilePictureUrl,
          );
        if (presignedUrl) {
          transformed.profilePictureUrl = presignedUrl;
        }
      }
      // Cas 2: profilePictureUrl est null ou undefined, mais la propriété existe (ex: objet User)
      else if (
        (transformed.profilePictureUrl === null ||
          transformed.profilePictureUrl === undefined) &&
        'profilePictureUrl' in transformed
      ) {
        // Injecter l'URL de l'image par défaut
        transformed.profilePictureUrl =
          await this.r2Service.generateDefaultProfilePictureUrl();
      }

      // Traiter récursivement les propriétés imbriquées
      for (const key of Object.keys(transformed)) {
        if (
          transformed[key] &&
          typeof transformed[key] === 'object' &&
          key !== 'profilePictureUrl'
        ) {
          transformed[key] = await this.transformR2Urls(transformed[key]);
        }
      }

      return transformed;
    }

    return data;
  }

  /**
   * Vérifie si une URL est une URL R2
   */
  private isR2Url(url: string): boolean {
    if (typeof url !== 'string') return false;
    return (
      url.startsWith('https://') && url.includes('.r2.cloudflarestorage.com')
    );
  }
}
