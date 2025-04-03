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

    async getUserProfile() {
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
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async deleteAccount() {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
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

        // Execute all deletions
        for (const deletion of deletions) {
            const { error } = await deletion;
            if (error) throw error;
        }

        // Finally, delete the user account
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) throw deleteError;
    }
}; 