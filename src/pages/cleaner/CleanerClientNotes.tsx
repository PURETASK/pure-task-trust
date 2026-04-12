import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCleanerClientNotes } from "@/hooks/useCleanerClientNotes";
import { StickyNote, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CleanerClientNotes() {
  const { notes, isLoading, saveNote } = useCleanerClientNotes();
  const [editing, setEditing] = useState<Record<string, string>>({});

  const handleSave = async (clientId: string, propertyId?: string | null) => {
    const key = `${clientId}-${propertyId || 'default'}`;
    if (editing[key] === undefined) return;
    await saveNote.mutateAsync({ clientId, propertyId: propertyId || undefined, notes: editing[key] });
    toast.success('Note saved');
    setEditing(e => { const copy = {...e}; delete copy[key]; return copy; });
  };

  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <StickyNote className="h-6 w-6 text-primary" /> Client Notes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Private notes about client preferences and property details</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
        ) : notes.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            No notes yet. Notes will appear here as you save them from job detail pages.
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {notes.map(note => {
              const key = `${note.client_id}-${note.property_id || 'default'}`;
              const isEditing = editing[key] !== undefined;
              return (
                <Card key={note.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Client: {note.client_id.slice(0, 8)}... • Updated {format(new Date(note.updated_at), 'MMM d, yyyy')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            handleSave(note.client_id, note.property_id);
                          } else {
                            setEditing(e => ({...e, [key]: note.notes}));
                          }
                        }}
                        disabled={saveNote.isPending}
                      >
                        {isEditing ? <><Save className="h-4 w-4 mr-1" /> Save</> : 'Edit'}
                      </Button>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editing[key]}
                        onChange={e => setEditing(ed => ({...ed, [key]: e.target.value}))}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{note.notes || 'No notes'}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
