import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '../../../src/lib/database/connection';
import { cacheService } from '../../../src/lib/cache/cache';
import { ObjectId } from 'mongodb';
import { UserDocument } from '../../../src/types';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');

    const usersCollection = await getUsersCollection();

    // Build query
    const query: Record<string, unknown> = { is_active: true };

    if (role) {
      query.role = role;
    }

    // Count total users for pagination
    const total = await usersCollection.countDocuments(query);

    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await usersCollection
      .find(query)
      .project({ password: 0 }) // Don't return password
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform users for API response
    const transformedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address || {},
      profile_image: user.profile_image || '',
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      preferences: user.preferences || {
        notifications: true,
        language: 'en',
        currency: 'KES'
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_users: total,
        users_per_page: limit,
        has_next: skip + limit < total,
        has_prev: page > 1,
      },
    });

  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// GET /api/users/me - Get current user profile (protected)
export async function GET_ME(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Access token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token (you'll need to implement this based on your auth system)
    const { verify } = await import('jsonwebtoken');
    const decoded = verify(token, process.env.JWT_SECRET!) as { user_id: string; email: string; role: string };

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Get user details
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.user_id) },
      { projection: { password: 0 } }
    );

    if (!user || !user.is_active) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address || {},
        profile_image: user.profile_image || '',
        preferences: user.preferences || {
          notifications: true,
          language: 'en',
          currency: 'KES'
        },
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
        is_active: user.is_active
      }
    });

  } catch (error) {
    console.error('User profile GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id] - Get user by ID (admin)
export async function GET_USER_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Try ObjectId first, then email as fallback
    let user;
    try {
      user = await usersCollection.findOne({ _id: new ObjectId(id) });
    } catch {
      user = await usersCollection.findOne({ email: id });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const transformedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address || {},
      profile_image: user.profile_image || '',
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      preferences: user.preferences || {
        notifications: true,
        language: 'en',
        currency: 'KES'
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
    });

  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user (admin)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Find existing user
    let existingUser;
    try {
      existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    } catch {
      existingUser = await usersCollection.findOne({ email: id });
    }

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const updateData = {
      name: body.name || existingUser.name,
      email: body.email || existingUser.email,
      phone: body.phone || existingUser.phone,
      address: body.address || existingUser.address,
      role: body.role || existingUser.role,
      profile_image: body.profile_image || existingUser.profile_image,
      preferences: body.preferences || existingUser.preferences,
      is_active: body.is_active !== undefined ? body.is_active : existingUser.is_active,
      updated_at: new Date(),
    };

    const result = await usersCollection.updateOne(
      { _id: existingUser._id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Clear user cache
    await cacheService.delete(`user:${existingUser._id.toString()}`);

    // Get updated user
    const updatedUser = await usersCollection.findOne(
      { _id: existingUser._id },
      { projection: { password: 0 } }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found after update' },
        { status: 404 }
      );
    }

    const transformedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address || {},
      profile_image: updatedUser.profile_image || '',
      is_active: updatedUser.is_active,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      last_login: updatedUser.last_login,
      preferences: updatedUser.preferences || {
        notifications: true,
        language: 'en',
        currency: 'KES'
      }
    };

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: transformedUser,
    });

  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (admin)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Find and delete user (soft delete)
    let user;
    try {
      user = await usersCollection.findOne({ _id: new ObjectId(id) });
    } catch {
      user = await usersCollection.findOne({ email: id });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const result = await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          is_active: false,
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Clear user cache
    await cacheService.delete(`user:${user._id.toString()}`);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: { deleted: true }
    });

  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}