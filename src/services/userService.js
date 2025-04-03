import { supabase } from '../lib/supabase';

export const userService = {
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    async signUp({ email, password }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    async signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async deleteAccount() {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No user found');

        // Delete all user data in the correct order to respect foreign key constraints
        const { error: reviewLogsError } = await supabase
            .from('review_logs')
            .delete()
            .eq('user_id', user.id);
        if (reviewLogsError) throw reviewLogsError;

        const { error: cardsError } = await supabase
            .from('cards')
            .delete()
            .eq('user_id', user.id);
        if (cardsError) throw cardsError;

        const { error: decksError } = await supabase
            .from('decks')
            .delete()
            .eq('user_id', user.id);
        if (decksError) throw decksError;

        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
        if (profileError) throw profileError;

        // Finally, delete the auth user
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteUserError) throw deleteUserError;
    }
}; 