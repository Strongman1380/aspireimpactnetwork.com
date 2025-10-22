/**
 * Authentication Module using Supabase Auth
 * Handles user login, registration, and session management
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign up new user
export async function signUp(email, password, metadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in existing user
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Get current session
export async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message };
  }
}

// Update user password
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: error.message };
  }
}

// Update user profile
export async function updateProfile(updates) {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

// Auth state change listener
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Protected route guard
export async function requireAuth() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    // Redirect to login
    const currentPath = window.location.pathname;
    window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
    return false;
  }

  return true;
}

// Member-only content guard
export async function requireMembership(minimumTier = 'basic') {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = '/login.html';
    return false;
  }

  // Check membership tier from user metadata
  const membershipTier = user.user_metadata?.membership_tier || 'none';

  const tierHierarchy = ['none', 'basic', 'premier', 'pro'];
  const userTierIndex = tierHierarchy.indexOf(membershipTier);
  const requiredTierIndex = tierHierarchy.indexOf(minimumTier);

  if (userTierIndex < requiredTierIndex) {
    window.location.href = `/membership.html?upgrade=${minimumTier}`;
    return false;
  }

  return true;
}

// Export all auth functions
export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  resetPassword,
  updatePassword,
  updateProfile,
  isAuthenticated,
  onAuthStateChange,
  requireAuth,
  requireMembership
};
