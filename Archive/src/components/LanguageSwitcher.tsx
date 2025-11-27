import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';

interface LanguageSwitcherProps {
  globalUILanguage: 'en' | 'fr';
  documentLanguage: 'en' | 'fr';
  onUILanguageChange: (language: 'en' | 'fr') => void;
  onDocumentLanguageChange: (language: 'en' | 'fr') => void;
}

export const LanguageSwitcher = ({
  globalUILanguage,
  documentLanguage,
  onUILanguageChange,
  onDocumentLanguageChange,
}: LanguageSwitcherProps) => {
  const { t } = useTranslation(globalUILanguage === 'fr' ? 'french' : 'english');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<'en' | 'fr'>('en');

  const handleUILanguageClick = (language: 'en' | 'fr') => {
    if (language === globalUILanguage) return;
    
    setPendingLanguage(language);
    setShowConfirmDialog(true);
  };

  const confirmLanguageChange = () => {
    onUILanguageChange(pendingLanguage);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span className="font-medium">
              {globalUILanguage === 'fr' ? 'FR' : 'EN'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            {t('uiLanguage')}
          </div>
          <DropdownMenuItem
            onClick={() => handleUILanguageClick('en')}
            className="flex items-center justify-between"
          >
            <span>English</span>
            {globalUILanguage === 'en' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUILanguageClick('fr')}
            className="flex items-center justify-between"
          >
            <span>Français</span>
            {globalUILanguage === 'fr' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            {t('documentLanguage')}
          </div>
          <DropdownMenuItem
            onClick={() => onDocumentLanguageChange('en')}
            className="flex items-center justify-between"
          >
            <span>English</span>
            {documentLanguage === 'en' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDocumentLanguageChange('fr')}
            className="flex items-center justify-between"
          >
            <span>Français</span>
            {documentLanguage === 'fr' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>{t('confirmLanguageChange')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('languageChangeDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 pt-4">
            <Button onClick={confirmLanguageChange} className="flex-1">
              {t('yes')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};