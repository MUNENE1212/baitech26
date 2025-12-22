import { NextRequest, NextResponse } from 'next/server';
import { config } from 'dotenv';
import { userCreateSchema, userLoginSchema, validateBody } from '../../../src/lib/validations/schemas';
import { hashPassword, verifyPassword } from '../../../src/lib/auth/password';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../../src/lib/auth/jwt';
import { getUsersCollection } from '../../../src/lib/database/connection';
import { cacheService } from '../../../src/lib/cache/cache';
import { ConflictError, UnauthorizedError, ValidationError } from '../../../src/types';
import { ObjectId } from 'mongodb';

// Load environment variables
config({ path: '.env.local' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine if this is a login or registration request
    const isLogin = body.email && body.password && !body.name && !body.role;

    if (isLogin) {
      // Validate login data
      const validation = validateBody(userLoginSchema)(body);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid login data', field: 'form' },
          { status: 400 }
        );
      }

      const { email, password } = validation.data!;
      const usersCollection = await getUsersCollection();

      // Find user by email
      const user = await usersCollection.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.hashed_password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Update last login
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            last_login: new Date(),
            updated_at: new Date()
          }
        }
      );

      // Create tokens
      const accessToken = createAccessToken({
        user_id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = createRefreshToken({
        user_id: user._id.toString(),
        email: user.email,
      });

      // Cache user data
      await cacheService.cacheUser(user._id.toString(), user, 1800);

      return NextResponse.json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'bearer',
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
          },
        },
      });
    } else {
      // Handle registration
      const validation = validateBody(userCreateSchema)(body);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid registration data', field: 'form' },
          { status: 400 }
        );
      }

      const { email, password, role, ...userData } = validation.data!;
      const usersCollection = await getUsersCollection();

      // Check if user already exists
      const existingUser = await usersCollection.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 409 }
        );
      }

      // Only allow customer role for public registration
      if (role !== 'customer') {
        return NextResponse.json(
          { success: false, error: 'Only customer accounts can be registered publicly', field: 'role' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user document
      const newUser = {
        name: userData.name,
        email: email.toLowerCase(),
        hashed_password: hashedPassword,
        role: role,
        phone: userData.phone,
        address: userData.address,
        isActive: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Insert user
      const result = await usersCollection.insertOne(newUser);

      // Create tokens
      const accessToken = createAccessToken({
        user_id: result.insertedId.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      const refreshToken = createRefreshToken({
        user_id: result.insertedId.toString(),
        email: newUser.email,
      });

      // Cache user data
      const createdUser = { ...newUser, _id: result.insertedId };
      await cacheService.cacheUser(result.insertedId.toString(), createdUser, 1800);

      return NextResponse.json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'bearer',
          user: {
            id: result.insertedId.toString(),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            address: newUser.address,
          },
        },
        message: 'User registered successfully',
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Refresh token endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const tokenData = verifyRefreshToken(refresh_token);

    // Get user from database
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(tokenData.user_id),
      email: tokenData.email,
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Create new access token
    const newAccessToken = createAccessToken({
      user_id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      data: {
        access_token: newAccessToken,
        token_type: 'bearer',
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}