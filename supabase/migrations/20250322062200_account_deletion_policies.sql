-- Enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for deletion
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own decks"
ON decks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
ON cards FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review logs"
ON review_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 