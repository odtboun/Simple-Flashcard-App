-- Create decks table if it doesn't exist
CREATE TABLE IF NOT EXISTS decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    total_cards INTEGER DEFAULT 0,
    due_cards INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for decks table
CREATE INDEX IF NOT EXISTS decks_user_id_idx ON decks(user_id);
CREATE INDEX IF NOT EXISTS decks_last_reviewed_at_idx ON decks(last_reviewed_at);

-- Enable RLS for decks table
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own decks" ON decks;
DROP POLICY IF EXISTS "Users can create their own decks" ON decks;
DROP POLICY IF EXISTS "Users can update their own decks" ON decks;
DROP POLICY IF EXISTS "Users can delete their own decks" ON decks;

-- Create RLS policies for decks table
CREATE POLICY "Users can view their own decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks" ON decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON decks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON decks
    FOR DELETE USING (auth.uid() = user_id);

-- Add deck_id to cards table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'deck_id') THEN
        ALTER TABLE cards ADD COLUMN deck_id UUID REFERENCES decks(id) ON DELETE CASCADE;
        CREATE INDEX cards_deck_id_idx ON cards(deck_id);
    END IF;
END $$;

-- Drop existing function and triggers if they exist
DROP TRIGGER IF EXISTS update_deck_stats_on_card_change ON cards;
DROP FUNCTION IF EXISTS update_deck_stats();

-- Create a function to update deck statistics
CREATE OR REPLACE FUNCTION update_deck_stats()
RETURNS TRIGGER AS $$
DECLARE
    deck_total INTEGER;
    deck_due INTEGER;
BEGIN
    -- If the card's deck_id has changed
    IF TG_OP = 'UPDATE' AND OLD.deck_id IS DISTINCT FROM NEW.deck_id THEN
        -- Update old deck stats if it exists
        IF OLD.deck_id IS NOT NULL THEN
            SELECT COUNT(*), COUNT(*) FILTER (WHERE next_review <= NOW())
            INTO deck_total, deck_due
            FROM cards
            WHERE deck_id = OLD.deck_id;
            
            UPDATE decks
            SET total_cards = deck_total,
                due_cards = deck_due,
                updated_at = NOW()
            WHERE id = OLD.deck_id;
        END IF;
    END IF;

    -- Update new/current deck stats
    IF NEW.deck_id IS NOT NULL THEN
        SELECT COUNT(*), COUNT(*) FILTER (WHERE next_review <= NOW())
        INTO deck_total, deck_due
        FROM cards
        WHERE deck_id = NEW.deck_id;
        
        UPDATE decks
        SET total_cards = deck_total,
            due_cards = deck_due,
            updated_at = NOW()
        WHERE id = NEW.deck_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update deck statistics
CREATE TRIGGER update_deck_stats_on_card_change
    AFTER INSERT OR UPDATE OR DELETE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_stats();

-- Create a trigger to update the updated_at timestamp for decks
-- Note: We're reusing the existing update_updated_at_column function
DROP TRIGGER IF EXISTS update_decks_updated_at ON decks;
CREATE TRIGGER update_decks_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a default deck for each existing user and move their cards to it
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM cards LOOP
        -- Create default deck if it doesn't exist
        INSERT INTO decks (user_id, name, description)
        SELECT user_record.user_id, 'Default Deck', 'Your default deck containing all existing cards'
        WHERE NOT EXISTS (
            SELECT 1 FROM decks 
            WHERE user_id = user_record.user_id 
            AND name = 'Default Deck'
        );
        
        -- Move cards to default deck if they don't have a deck
        UPDATE cards
        SET deck_id = (
            SELECT id
            FROM decks
            WHERE user_id = user_record.user_id
            AND name = 'Default Deck'
            ORDER BY created_at DESC
            LIMIT 1
        )
        WHERE user_id = user_record.user_id
        AND deck_id IS NULL;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 