import { supabase } from '../lib/supabase';

export async function getCards() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  console.log('Fetching cards for user:', user.id);

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

  if (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }

  console.log('Total cards found:', data?.length || 0);
  console.log('Sample card data:', data?.[0]);
  return data || [];
}

export async function getDueCards(deckIds = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  console.log('Fetching due cards for user:', user.id);

  // Get current time in ISO format
  const now = new Date().toISOString();
  console.log('Current time:', now);

  let query = supabase
    .from('cards')
    .select(`
      *,
      deck:deck_id (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .lte('next_review', now);

  // If specific decks are requested, filter by those deck IDs
  if (deckIds && deckIds.length > 0) {
    query = query.in('deck_id', deckIds);
  }

  const { data, error } = await query.order('next_review', { ascending: true });

  if (error) {
    console.error('Error fetching due cards:', error);
    throw error;
  }

  console.log('Due cards found:', data?.length || 0);
  console.log('Sample due card:', data?.[0]);
  return data || [];
}

export async function createCard({ front, back, deck_id }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  console.log('Creating card for user:', user.id);

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('cards')
    .insert([{
      user_id: user.id,
      deck_id,
      front,
      back,
      easiness: 2.5,
      repetitions: 0,
      interval: 1,
      next_review: now, // Set to current time to make immediately reviewable
    }])
    .select(`
      *,
      deck:deck_id (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error creating card:', error);
    throw error;
  }

  console.log('Created new card:', data);
  return data;
}

export async function updateCard(id, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      deck:deck_id (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error updating card:', error);
    throw error;
  }

  return data;
}

export async function deleteCard(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
}

export async function updateCardReview(id, { easiness, interval, repetitions }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  const nextReviewStr = nextReview.toISOString();

  console.log('Updating card review:', { id, nextReviewStr, easiness, interval, repetitions });

  const { data, error } = await supabase
    .from('cards')
    .update({
      easiness,
      interval,
      repetitions,
      next_review: nextReviewStr,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      deck:deck_id (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error updating card review:', error);
    throw error;
  }

  return data;
}

export async function moveCardToDeck(cardId, newDeckId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('cards')
    .update({ deck_id: newDeckId })
    .eq('id', cardId)
    .eq('user_id', user.id)
    .select(`
      *,
      deck:deck_id (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error moving card to deck:', error);
    throw error;
  }

  return data;
} 