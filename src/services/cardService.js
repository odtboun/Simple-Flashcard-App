import { supabase } from '../lib/supabase';
import { initializeCard } from './fsrsService';

export async function getCards() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      deck:deck_id (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDueCards() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      deck:deck_id (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .lte('due', now)
    .order('due');

  if (error) throw error;
  return data || [];
}

export async function createCard({ front, back, deckId }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  // Initialize card with FSRS
  const fsrsCard = initializeCard();
  
  const { data, error } = await supabase
    .from('cards')
    .insert([{
      front,
      back,
      deck_id: deckId,
      user_id: user.id,
      // FSRS properties - use values directly from FSRS
      due: fsrsCard.due,
      stability: fsrsCard.stability,
      difficulty: fsrsCard.difficulty,
      elapsed_days: fsrsCard.elapsed_days,
      scheduled_days: fsrsCard.scheduled_days,
      reps: fsrsCard.reps,
      lapses: fsrsCard.lapses,
      state: 'New', // Explicitly set to 'New' for new cards
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCard(cardId, { front, back }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('cards')
    .update({ front, back })
    .eq('id', cardId)
    .eq('user_id', user.id)  // Ensure user can only update their own cards
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCard(cardId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)
    .eq('user_id', user.id);  // Ensure user can only delete their own cards

  if (error) throw error;
}

export async function moveCardToDeck(cardId, deckId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('cards')
    .update({ deck_id: deckId })
    .eq('id', cardId)
    .eq('user_id', user.id)  // Ensure user can only move their own cards
    .select()
    .single();

  if (error) throw error;
  return data;
} 