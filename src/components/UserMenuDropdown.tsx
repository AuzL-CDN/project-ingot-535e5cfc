import { User, Settings, Shield, Upload, BarChart3, Users, Moon, Sun, Monitor, Languages, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from './auth/AuthProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { AdminTab } from './tabs/AdminTab';

interface UserMenuDropdownProps {
  inspector: {
    name: string;
    initials: string;
    email: string;
  };
  globalUILanguage: string;
  documentLanguage: string;
  onUILanguageChange: (language: string) => void;
  onDocumentLanguageChange: (language: string) => void;
}

export function UserMenuDropdown({ 
  inspector, 
  globalUILanguage, 
  documentLanguage, 
  onUILanguageChange, 
  onDocumentLanguageChange 
}: UserMenuDropdownProps) {
  const { user, isAdmin, isDev, signOut } = useAuth();
  
  // Debug logging
  console.log('🎯 UserMenuDropdown render:', {
    user: user?.email,
    isAdmin,
    isDev,
    inspector: inspector.email
  });
  
  // Safe theme hook usage with fallback
  let theme: 'light' | 'dark' | 'system' = 'system';
  let setTheme: (theme: 'light' | 'dark' | 'system') => void = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    setTheme = themeContext.setTheme;
  } catch (error) {
    console.warn('ThemeProvider not found, using default theme');
  }
  
  const { t } = useTranslation(globalUILanguage === 'fr' ? 'french' : 'english');
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    window.location.reload();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 h-auto py-2 px-3">
            <div className="text-right text-sm">
              <p className="font-medium text-foreground">{inspector.name} ({inspector.initials})</p>
              <p className="text-muted-foreground">{inspector.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>{inspector.name}</span>
            {isDev && <Badge variant="secondary" className="text-xs">Dev</Badge>}
            {isAdmin && <Badge variant="default" className="text-xs">Admin</Badge>}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="ml-2 h-6 px-2 text-xs"
            >
              Refresh
            </Button>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Theme Selection */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center space-x-2">
                {theme === 'light' && <Sun className="h-4 w-4" />}
                {theme === 'dark' && <Moon className="h-4 w-4" />}
                {theme === 'system' && <Monitor className="h-4 w-4" />}
                <span>{t('theme')}</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>{t('light')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>{t('dark')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>{t('system')}</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Language Selection */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages className="mr-2 h-4 w-4" />
              <span>{t('language')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1">
                {t('interfaceLanguage')}
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => onUILanguageChange('english')}
                className={globalUILanguage === 'english' ? 'bg-accent' : ''}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onUILanguageChange('fr')}
                className={globalUILanguage === 'fr' ? 'bg-accent' : ''}
              >
                Français
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1">
                {t('documentLanguage')}
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => onDocumentLanguageChange('english')}
                className={documentLanguage === 'english' ? 'bg-accent' : ''}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDocumentLanguageChange('fr')}
                className={documentLanguage === 'fr' ? 'bg-accent' : ''}
              >
                Français
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Admin Functions (only visible to admins) */}
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center space-x-2 text-xs font-normal text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>{t('adminFunctions')}</span>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('adminPanel')}</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Admin Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>{t('adminPanel')}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <AdminTab />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}