import { supabase } from '../lib/supabase';

export async function getDecks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  console.log('Fetching decks for user:', user.id);

  // First get all decks
  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id);

  if (decksError) {
    console.error('Error fetching decks:', decksError);
    throw decksError;
  }

  console.log('Raw decks:', decks);

  if (!decks || decks.length === 0) {
    return [];
  }

  // Then get all cards for these decks
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .in('deck_id', decks.map(d => d.id));

  if (cardsError) {
    console.error('Error fetching cards:', cardsError);
    throw cardsError;
  }

  console.log('Raw cards:', cards);

  // Group cards by deck
  const cardsByDeck = {};
  cards?.forEach(card => {
    if (!cardsByDeck[card.deck_id]) {
      cardsByDeck[card.deck_id] = [];
    }
    cardsByDeck[card.deck_id].push(card);
  });

  // Calculate counts
  const now = new Date();
  const transformedData = decks.map(deck => ({
    ...deck,
    total_cards: cardsByDeck[deck.id]?.length || 0,
    due_cards: cardsByDeck[deck.id]?.filter(card => card.due && new Date(card.due) <= now).length || 0
  }));

  console.log('Final transformed data:', transformedData);
  return transformedData;
}

export async function getDeck(deckId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching deck:', error);
    throw error;
  }

  return data;
}

export async function createDeck({ name, description }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('decks')
    .insert([{
      user_id: user.id,
      name,
      description,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating deck:', error);
    throw error;
  }

  return data;
}

export async function updateDeck(deckId, { name, description }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('decks')
    .update({ name, description })
    .eq('id', deckId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating deck:', error);
    throw error;
  }

  return data;
}

export async function deleteDeck(deckId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
}

export async function getDueDecks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id)
    .gt('due_cards', 0)
    .order('last_reviewed_at', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('Error fetching due decks:', error);
    throw error;
  }

  return data || [];
}

export async function getCardsInDeck(deckId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cards in deck:', error);
    throw error;
  }

  return data || [];
}

export async function getDueCardsInDeck(deckId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .eq('user_id', user.id)
    .lte('due', now)
    .order('due', { ascending: true });

  if (error) {
    console.error('Error fetching due cards in deck:', error);
    throw error;
  }

  return data || [];
} 