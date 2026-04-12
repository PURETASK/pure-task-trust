import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useReceipt() {
  const generateReceipt = useMutation({
    mutationFn: async ({ type, jobId, transactionId }: { type: 'job_completion' | 'credit_purchase'; jobId?: string; transactionId?: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { type, jobId, transactionId },
      });

      if (error) throw error;
      return data as { receipt: Record<string, unknown>; html: string };
    },
    onSuccess: (data) => {
      // Open receipt in new window for printing/saving
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(data.html);
        win.document.close();
      } else {
        // Fallback: download as HTML
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${data.receipt.receiptNumber || 'puretask'}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success('Receipt generated!');
    },
    onError: () => {
      toast.error('Failed to generate receipt');
    },
  });

  return {
    generateReceipt: generateReceipt.mutate,
    isGenerating: generateReceipt.isPending,
  };
}
