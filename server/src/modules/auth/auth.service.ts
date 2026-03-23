import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../middleware/error-handler';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(401, 'Account is deactivated');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });

      if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user.id, user.role);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError(400, 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // TODO: Send email with reset link using Resend
    // For now, log the token in development
    if (config.nodeEnv === 'development') {
      console.log(`Password reset token for ${email}: ${token}`);
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
        staffProfile: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
            jobTitle: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  private generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn as string,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as string,
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
