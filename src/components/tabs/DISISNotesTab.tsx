import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Copy, FileText, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DISISNote } from '@/hooks/useInspectionState';

interface DISISNotesTabProps {
  disisNotes: DISISNote[];
  addDISISNote: (content: string) => DISISNote;
  deleteDISISNote: (id: string) => void;
  getDISISNotesAsText: () => string;
  saveActivity: () => any;
  globalUILanguage: 'en' | 'fr';
}

export const DISISNotesTab = ({
  disisNotes,
  addDISISNote,
  deleteDISISNote,
  getDISISNotesAsText,
  saveActivity,
  globalUILanguage,
}: DISISNotesTabProps) => {
  const { toast } = useToast();
  const { t } = useTranslation(globalUILanguage === 'fr' ? 'french' : 'english');
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    addDISISNote(newNote);
    setNewNote('');
    saveActivity();
    
    toast({
      title: t('noteSaved'),
      description: t('noteSavedDesc'),
    });
  };

  const handleCopyToClipboard = async () => {
    const notesText = getDISISNotesAsText();
    if (!notesText) return;
    
    try {
      await navigator.clipboard.writeText(notesText);
      toast({
        title: t('notesCopied'),
        description: t('notesCopiedDesc'),
      });
    } catch (err) {
      console.error('Failed to copy notes:', err);
    }
  };

  const handleDeleteNote = (id: string) => {
    deleteDISISNote(id);
    saveActivity();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>{t('disisNotes')}</span>
          </CardTitle>
          <CardDescription>
            {t('disisNotesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Note Section */}
          <div className="space-y-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={t('enterNote')}
              className="min-h-[120px] resize-none"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addNote')}
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                disabled={disisNotes.length === 0}
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('copyToClipboard')}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Existing Notes */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">
              {globalUILanguage === 'fr' ? 'Notes existantes' : 'Existing Notes'} ({disisNotes.length})
            </h3>
            
            {disisNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('noNotes')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {disisNotes
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((note) => (
                      <Card key={note.id} className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              {note.date}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
