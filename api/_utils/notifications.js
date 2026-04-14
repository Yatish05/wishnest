import { supabase } from './supabase.js';

export const sendNotification = async (userId, message, type = 'info') => {
  try {
    await supabase.from('notifications').insert({ user_id: userId, message, type });
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
};
