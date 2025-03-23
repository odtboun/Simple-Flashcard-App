-- Rename next_review to due
ALTER TABLE cards RENAME COLUMN next_review TO due;

-- Add new columns for FSRS
ALTER TABLE cards
ADD COLUMN stability FLOAT DEFAULT 0,
ADD COLUMN difficulty FLOAT DEFAULT 0,
ADD COLUMN elapsed_days INTEGER DEFAULT 0,
ADD COLUMN scheduled_days INTEGER DEFAULT 0,
ADD COLUMN reps INTEGER DEFAULT COALESCE(repetitions, 0),
ADD COLUMN lapses INTEGER DEFAULT 0,
ADD COLUMN state TEXT DEFAULT 'New' CHECK (state IN ('New', 'Learning', 'Review', 'Relearning')),
ADD COLUMN last_review TIMESTAMP WITH TIME ZONE;

-- Create an enum type for FSRS ratings
CREATE TYPE fsrs_rating AS ENUM ('Again', 'Hard', 'Good', 'Easy');

-- Create a table to store review logs
CREATE TABLE review_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating fsrs_rating NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('New', 'Learning', 'Review', 'Relearning')),
    due TIMESTAMP WITH TIME ZONE NOT NULL,
    stability FLOAT NOT NULL,
    difficulty FLOAT NOT NULL,
    elapsed_days INTEGER NOT NULL,
    last_elapsed_days INTEGER,
    scheduled_days INTEGER NOT NULL,
    review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_review_logs_card_id ON review_logs(card_id);
CREATE INDEX idx_review_logs_user_id ON review_logs(user_id);
CREATE INDEX idx_review_logs_review ON review_logs(review);

-- Enable RLS for review_logs
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for review_logs
CREATE POLICY "Users can view their own review logs"
    ON review_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review logs"
    ON review_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to update card stats after review
CREATE OR REPLACE FUNCTION update_card_after_review()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cards
    SET 
        state = NEW.state,
        stability = NEW.stability,
        difficulty = NEW.difficulty,
        elapsed_days = NEW.elapsed_days,
        scheduled_days = NEW.scheduled_days,
        last_review = NEW.review,
        due = NEW.due,
        reps = CASE 
            WHEN NEW.state = 'Review' THEN reps + 1
            ELSE reps
        END,
        lapses = CASE 
            WHEN NEW.state = 'Relearning' THEN lapses + 1
            ELSE lapses
        END
    WHERE id = NEW.card_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update card stats after review
CREATE TRIGGER after_review_log_insert
    AFTER INSERT ON review_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_card_after_review();

-- Migrate existing data
UPDATE cards
SET 
    stability = 0,
    difficulty = 0,
    elapsed_days = 0,
    scheduled_days = COALESCE(interval, 1),
    reps = COALESCE(repetitions, 0),
    lapses = 0,
    state = CASE 
        WHEN repetitions > 0 THEN 'Review'
        ELSE 'New'
    END,
    last_review = NULL; 