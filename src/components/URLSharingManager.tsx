import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Copy, Share2, Users, Eye, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface URLSharingManagerProps {
  onSessionChange: (sessionId: string) => void;
  currentSession: string;
  isHost: boolean;
  connectedAssessors: number;
}

export function URLSharingManager({ 
  onSessionChange, 
  currentSession, 
  isHost,
  connectedAssessors 
}: URLSharingManagerProps) {
  const [customSessionId, setCustomSessionId] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const generateSessionId = () => {
    const adjectives = ['Red', 'Blue', 'Green', 'Gold', 'Silver', 'Fast', 'Smart', 'Bold', 'Swift', 'Bright'];
    const nouns = ['Lion', 'Eagle', 'Tiger', 'Wolf', 'Bear', 'Shark', 'Phoenix', 'Dragon', 'Falcon', 'Panther'];
    const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}${numbers}`;
  };

  const createNewSession = () => {
    const sessionId = customSessionId.trim() || generateSessionId();
    const url = new URL(window.location.href);
    url.searchParams.set('session', sessionId);
    window.history.replaceState({}, '', url.toString());
    onSessionChange(sessionId);
    setCustomSessionId('');
    setShowCreateForm(false);
    toast.success(`New session created: ${sessionId}`);
  };

  const joinSession = (sessionId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('session', sessionId);
    window.history.replaceState({}, '', url.toString());
    onSessionChange(sessionId);
    toast.success(`Joined session: ${sessionId}`);
  };

  const copySessionURL = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('session', currentSession);
    navigator.clipboard.writeText(url.toString());
    toast.success('Session URL copied to clipboard!');
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(currentSession);
    toast.success('Session code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Current Session Status */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Share2 className="w-5 h-5" />
            Live Session: {currentSession}
            {isHost && <Badge className="bg-red-600">Host</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-red-100">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">Connected Assessors</div>
                <div className="text-sm text-red-700">{connectedAssessors} active assessor{connectedAssessors !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <Badge variant="outline" className="border-green-300 text-green-700">
              Live
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button 
              onClick={copySessionURL} 
              variant="outline" 
              className="border-red-200 hover:bg-red-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Full URL
            </Button>
            <Button 
              onClick={copySessionCode} 
              variant="outline" 
              className="border-red-200 hover:bg-red-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Session Code
            </Button>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-900">
              <div className="font-medium mb-1">Share with Assessors:</div>
              <div>1. Send them the full URL above, OR</div>
              <div>2. Send them the session code: <span className="font-mono font-bold">{currentSession}</span></div>
              <div>3. They can enter the code in the "Join Session" section below</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-red-200" />

      {/* Create New Session */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Plus className="w-5 h-5" />
            Host New Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCreateForm ? (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Assessment Session
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="customSession">Custom Session Name (optional)</Label>
                <Input
                  id="customSession"
                  value={customSessionId}
                  onChange={(e) => setCustomSessionId(e.target.value)}
                  placeholder="e.g., Morning-Assessment or leave blank for auto-generated"
                  className="bg-white/80"
                />
                <p className="text-sm text-red-600">
                  Leave blank to auto-generate a name like "RedLion42"
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={createNewSession}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Create Session
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setCustomSessionId('');
                  }}
                  variant="outline"
                  className="border-red-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Join Existing Session */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Eye className="w-5 h-5" />
            Join Existing Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="joinSession">Enter Session Code</Label>
            <div className="flex gap-2">
              <Input
                id="joinSession"
                placeholder="e.g., RedLion42"
                className="bg-white/80"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const sessionId = (e.target as HTMLInputElement).value.trim();
                    if (sessionId) {
                      joinSession(sessionId);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <Button 
                onClick={(e) => {
                  const input = document.getElementById('joinSession') as HTMLInputElement;
                  const sessionId = input?.value.trim();
                  if (sessionId) {
                    joinSession(sessionId);
                    input.value = '';
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Join
              </Button>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-900">
              <div className="font-medium mb-1">💡 For Assessors:</div>
              <div>If someone shared a session code with you, enter it above to join their assessment session and see all data in real-time.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <RefreshCw className="w-5 h-5" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-red-700 mb-3">Recently used session codes:</div>
            {(() => {
              const recentSessions = JSON.parse(localStorage.getItem('recent-sessions') || '[]')
                .filter((s: string) => s !== currentSession)
                .slice(0, 3);
              
              if (recentSessions.length === 0) {
                return (
                  <div className="text-sm text-red-600 italic">
                    No recent sessions. Create or join a session to see them here.
                  </div>
                );
              }

              return recentSessions.map((sessionId: string) => (
                <div key={sessionId} className="flex items-center justify-between p-2 bg-white/60 rounded border border-red-100">
                  <span className="font-mono text-sm">{sessionId}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => joinSession(sessionId)}
                    className="border-red-200 hover:bg-red-50"
                  >
                    Rejoin
                  </Button>
                </div>
              ));
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}