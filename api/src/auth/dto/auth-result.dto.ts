export class AuthResultDto {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
