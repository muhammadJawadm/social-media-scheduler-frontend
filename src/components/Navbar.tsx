import { Link, useLocation } from 'wouter';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { LogOut, Calendar, LayoutDashboard, FileText } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-home">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Social Scheduler</span>
            </a>
          </Link>
          
          {user && (
            // Make primary navigation visible on all screen sizes; compress label on very small screens via utility classes.
            <nav className="flex items-center gap-2">
              <Link href="/">
                <a data-testid="link-dashboard">
                  <Button 
                    variant={location === '/' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-1 px-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden xs:inline">Dashboard</span>
                  </Button>
                </a>
              </Link>
              <Link href="/posts">
                <a data-testid="link-posts">
                  <Button 
                    variant={location === '/posts' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-1 px-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden xs:inline">Posts</span>
                  </Button>
                </a>
              </Link>
            </nav>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-email">
              {user.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
