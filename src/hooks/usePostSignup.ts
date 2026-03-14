import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';

/**
 * Handles post-signup side-effects that don't belong in AuthContext:
 *  - Persisting the pending OAuth role (set before Google redirect)
 *  - Creating user_roles / profile rows when they're missing
 *  - Triggering the welcome email for new users
 *
 * Mount this once near the root (e.g. inside App.tsx).
 */
export function usePostSignup() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user) return;

    const user = session.user;

    const run = async () => {
      const pendingRole = localStorage.getItem('pendingOAuthRole') as UserRole | null;

      if (pendingRole) {
        // Check if role already exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingRole) {
          await supabase.from('user_roles').insert({
            user_id: user.id,
            role: pendingRole,
          });

          if (pendingRole === 'cleaner') {
            await supabase.from('cleaner_profiles').upsert(
              { user_id: user.id, first_name: user.user_metadata?.full_name },
              { onConflict: 'user_id' },
            );
          } else {
            await supabase.from('client_profiles').upsert(
              { user_id: user.id, first_name: user.user_metadata?.full_name },
              { onConflict: 'user_id' },
            );
            await supabase
              .from('credit_accounts')
              .upsert({ user_id: user.id }, { onConflict: 'user_id' });
          }
        }

        localStorage.removeItem('pendingOAuthRole');
      }

      // Send welcome email only for brand-new signups (created within last 60 s)
      const createdAt = new Date(user.created_at);
      const isNewUser = Date.now() - createdAt.getTime() < 60_000;
      if (isNewUser) {
        const role = user.user_metadata?.role as UserRole | undefined;
        if (role) {
          const template = role === 'cleaner' ? 'welcome_cleaner' : 'welcome_client';
          supabase.functions
            .invoke('send-email', {
              body: {
                to: user.email,
                template,
                data: { name: user.email?.split('@')[0] || 'there' },
              },
            })
            .then(({ error }) => {
              if (error) console.error('Failed to send welcome email:', error);
            });
        }
      }
    };

    run().catch(err => console.error('usePostSignup error:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);
}
