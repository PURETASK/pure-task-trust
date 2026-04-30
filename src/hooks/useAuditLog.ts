import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export function useAuditLog() {
  const [filters, setFilters] = useState({
    action: '',
    actorType: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['audit-log', filters],
    queryFn: async () => {
      // Reads from `admin_audit_log` (the canonical, written-to table).
      // Wave 1 / Primitive #1: previously this hook read from the empty
      // `audit_log` table, which is why AdminAuditLog.tsx looked broken.
      let query = supabase
        .from('admin_audit_log')
        .select('id, admin_user_id, action, entity_type, entity_id, old_values, new_values, reason, success, error_message, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters.action) query = query.eq('action', filters.action);
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredEntries = filters.search
    ? entries.filter(e =>
        e.action.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.entity_type?.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.entity_id?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : entries;

  return { entries: filteredEntries, isLoading, filters, setFilters };
}
