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
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters.action) query = query.eq('action', filters.action);
      if (filters.actorType) query = query.eq('actor_type', filters.actorType);
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
        e.target_table?.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.target_id?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : entries;

  return { entries: filteredEntries, isLoading, filters, setFilters };
}
