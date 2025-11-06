import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  User, 
  LogOut, 
  HelpCircle, 
  Wifi, 
  WifiOff, 
  ChevronDown,
  Target,
  Settings,
  Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TopBarProps {
  user: {
    email: string;
    role: 'assessor' | 'admin';
    name?: string;
  };
  currentEvent: {
    id: string;
    name: string;
  };
  availableEvents: Array<{
    id: string;
    name: string;
    status: 'active' | 'upcoming' | 'completed';
  }>;
  isOnline: boolean;
  onEventChange: (eventId: string) => void;
  onShowHelp: () => void;
  onSignOut: () => void;
}

export function TopBar({ 
  user, 
  currentEvent, 
  availableEvents, 
  isOnline, 
  onEventChange, 
  onShowHelp,
  onSignOut 
}: TopBarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="border-b border-red-200 glass sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Left: Logo and Event Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden md:block">
              Future Ready Assessment
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            <Select value={currentEvent.id} onValueChange={onEventChange}>
              <SelectTrigger className="w-[200px] border-red-200 bg-white/80 backdrop-blur-sm shadow-sm">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getEventStatusColor(
                      availableEvents.find(e => e.id === currentEvent.id)?.status || 'active'
                    )}`} />
                    <span className="truncate">{currentEvent.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getEventStatusColor(event.status)}`} />
                      <span>{event.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {event.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Connection Status, Help, Profile */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 hidden md:block">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 hidden md:block">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowHelp}
            className="text-red-700 hover:bg-red-50"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:block ml-2">Help</span>
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-red-900 hover:bg-red-50">
                <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-red-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-xs text-red-600 capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium">{user.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {user.role === 'admin' ? 'Administrator' : 'Assessor'}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              
              {user.role === 'admin' && (
                <>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Documentation
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}