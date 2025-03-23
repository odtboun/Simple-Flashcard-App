import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs';
import { supabase } from '../lib/supabase';

// FSRS instance with default parameters
const f = fsrs(generatorParameters());

export const FsrsRating = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy
};

// Convert numeric rating to string for database
function getRatingString(rating) {
  switch (rating) {
    case Rating.Again:
      return 'Again';
    case Rating.Hard:
      return 'Hard';
    case Rating.Good:
      return 'Good';
    case Rating.Easy:
      return 'Easy';
    default:
      throw new Error('Invalid rating');
  }
}

export async function getCardForReview(cardId) {
  const { data: card, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (error) throw error;
  return card;
}

export async function createReviewLog(cardId, rating, schedulingInfo) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  // First verify the card exists and belongs to the user
  const { data: existingCard, error: fetchError } = await supabase
    .from('cards')
    .select('id')
    .eq('id', cardId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;
  if (!existingCard) throw new Error('Card not found');

  const { data: log, error } = await supabase
    .from('review_logs')
    .insert([{
      card_id: cardId,
      user_id: user.id,
      rating: getRatingString(rating),
      state: schedulingInfo.state,
      due: schedulingInfo.due,
      stability: schedulingInfo.stability,
      difficulty: schedulingInfo.difficulty,
      elapsed_days: schedulingInfo.elapsed_days,
      last_elapsed_days: schedulingInfo.last_elapsed_days,
      scheduled_days: schedulingInfo.scheduled_days,
      review: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return log;
}

export function initializeCard(now = new Date()) {
  return createEmptyCard(now);
}

export function scheduleCard(card, now = new Date()) {
  return f.repeat(card, now);
}

export function scheduleCardWithRating(card, rating, now = new Date()) {
  const schedulingInfo = f.next(card, now, rating);
  
  // Map FSRS state to our database state
  let state;
  if (card.state === 'New' && rating === Rating.Again) {
    state = 'Learning';
  } else if (card.state === 'New' && rating !== Rating.Again) {
    state = 'Review';
  } else if (schedulingInfo.lapses > card.lapses) {
    state = 'Relearning';
  } else if (card.state === 'Learning' && rating !== Rating.Again) {
    state = 'Review';
  } else if (card.state === 'Relearning' && rating !== Rating.Again) {
    state = 'Review';
  } else {
    state = card.state;
  }

  // Calculate the due date safely
  let dueDate;
  try {
    // If scheduled_days is too large, cap it at 10 years
    const maxDays = 365 * 10;
    const days = Math.min(Math.ceil(schedulingInfo.scheduled_days || 0), maxDays);
    dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + days);
  } catch (error) {
    console.error('Error calculating due date:', error);
    // Fallback to a reasonable default (1 day from now)
    dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 1);
  }
  
  return {
    ...schedulingInfo,
    due: dueDate.toISOString(),
    state,
    // Ensure all required fields have defaults
    stability: schedulingInfo.stability || 0,
    difficulty: schedulingInfo.difficulty || 0,
    elapsed_days: schedulingInfo.elapsed_days || 0,
    scheduled_days: Math.min(schedulingInfo.scheduled_days || 0, 365 * 10), // Cap at 10 years
    reps: (card.reps || 0) + 1,
    lapses: schedulingInfo.lapses || card.lapses || 0,
    last_elapsed_days: schedulingInfo.elapsed_days || 0
  };
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
    .or(`due.lte.${now},state.eq.New`)  // Get cards that are either due or new
    .order('due');

  if (error) throw error;
  return data || [];
}

export async function getReviewHistory(cardId) {
  const { data: logs, error } = await supabase
    .from('review_logs')
    .select('*')
    .eq('card_id', cardId)
    .order('review', { ascending: false });

  if (error) throw error;
  return logs;
}

export function calculateReviewStats(logs) {
  return {
    totalReviews: logs.length,
    againCount: logs.filter(log => log.rating === 'Again').length,
    hardCount: logs.filter(log => log.rating === 'Hard').length,
    goodCount: logs.filter(log => log.rating === 'Good').length,
    easyCount: logs.filter(log => log.rating === 'Easy').length,
    averageInterval: logs.reduce((sum, log) => sum + log.scheduled_days, 0) / logs.length || 0,
    lapses: logs.filter(log => log.state === 'Relearning').length
  };
}

export async function updateCardSchedule(cardId, schedulingInfo) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  // First verify the card exists and belongs to the user
  const { data: existingCard, error: fetchError } = await supabase
    .from('cards')
    .select('id')
    .eq('id', cardId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;
  if (!existingCard) throw new Error('Card not found');

  // Then update the card
  const { data: card, error } = await supabase
    .from('cards')
    .update({
      due: schedulingInfo.due,
      stability: schedulingInfo.stability,
      difficulty: schedulingInfo.difficulty,
      elapsed_days: schedulingInfo.elapsed_days,
      scheduled_days: schedulingInfo.scheduled_days,
      reps: schedulingInfo.reps,
      lapses: schedulingInfo.lapses,
      state: schedulingInfo.state,
      last_review: new Date().toISOString()
    })
    .eq('id', cardId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return card;
} 