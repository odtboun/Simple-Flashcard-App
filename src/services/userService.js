import { supabase } from '../lib/supabase';

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  
  return {
    ...profile,
    email: user.email
  };
}

export async function updateUserProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function deleteAccount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  // Delete all user data in order (respecting foreign key constraints)
  const deletions = [
    // Delete review logs first (they reference cards)
    supabase.from('review_logs').delete().eq('user_id', user.id),
    
    // Delete cards (they reference decks)
    supabase.from('cards').delete().eq('user_id', user.id),
    
    // Delete decks
    supabase.from('decks').delete().eq('user_id', user.id),
    
    // Delete profile
    supabase.from('profiles').delete().eq('id', user.id),
  ];

  // Execute all deletions in parallel
  await Promise.all(deletions);

  // Finally, delete the user's authentication account
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) throw error;
} 