import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    profilePictureUrl: null,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSafeUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    profilePictureUrl: null,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  const mockUsersService = {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return safe user when credentials are valid', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockSafeUser);
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return null when user does not exist', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when password is invalid', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    });
  });

  describe('signIn', () => {
    it('should return access token, refresh token and user', async () => {
      const mockAccessToken = 'mockAccessToken';
      const mockRefreshToken = 'mockRefreshToken';
      const mockHashedRefreshToken = 'hashedRefreshToken';

      mockJwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedRefreshToken);
      mockUsersService.updateUser.mockResolvedValue(undefined);

      const result = await service.signIn(mockSafeUser);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        user: mockSafeUser,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRefreshToken, 10);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(1, {
        refreshToken: mockHashedRefreshToken,
      });
    });
  });

  describe('register', () => {
    const signUpDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
    };

    it('should successfully register a new user', async () => {
      const mockAccessToken = 'mockAccessToken';
      const mockRefreshToken = 'mockRefreshToken';
      const mockHashedPassword = 'hashedPassword';
      const mockHashedRefreshToken = 'hashedRefreshToken';

      mockUsersService.findUserByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce(mockHashedPassword)
        .mockResolvedValueOnce(mockHashedRefreshToken);
      mockUsersService.createUser.mockResolvedValue({
        ...mockUser,
        email: signUpDto.email,
        name: signUpDto.name,
        password: mockHashedPassword,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);
      mockUsersService.updateUser.mockResolvedValue(undefined);

      const result = await service.register(signUpDto);

      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(signUpDto.email);
      expect(mockUsersService.createUser).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when email already exists', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);

      await expect(service.register(signUpDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.register(signUpDto)).rejects.toThrow('Email already in use');
    });
  });

  describe('logout', () => {
    it('should clear refresh token for user', async () => {
      mockUsersService.updateUser.mockResolvedValue(undefined);

      await service.logout(1);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(1, { refreshToken: null });
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'validRefreshToken';
    const mockPayload = { sub: 1, email: 'test@example.com' };

    it('should return new access and refresh tokens when valid', async () => {
      const mockNewAccessToken = 'newAccessToken';
      const mockNewRefreshToken = 'newRefreshToken';
      const mockHashedRefreshToken = 'hashedRefreshToken';

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockUsersService.findUserById.mockResolvedValue({
        ...mockUser,
        refreshToken: 'storedHashedToken',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockNewAccessToken)
        .mockResolvedValueOnce(mockNewRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedRefreshToken);
      mockUsersService.updateUser.mockResolvedValue(undefined);

      const result = await service.refreshToken(mockRefreshToken);

      expect(result).toEqual({
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken,
      });
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user has no refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockUsersService.findUserById.mockResolvedValue({
        ...mockUser,
        refreshToken: null,
      });

      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token does not match', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockUsersService.findUserById.mockResolvedValue({
        ...mockUser,
        refreshToken: 'storedHashedToken',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getFreshUser', () => {
    it('should return user without password and refreshToken', async () => {
      mockUsersService.findUserById.mockResolvedValue(mockUser);

      const result = await service.getFreshUser(1);

      expect(result).toEqual(mockSafeUser);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(1);
    });
  });
});
