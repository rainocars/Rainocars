import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('raino-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('raino-theme', theme);
  }, [theme]);

  const navLinkClass = (path: string) => cn(
    'relative text-sm font-medium text-off-white/70 transition-colors duration-300 hover:text-accent after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300',
    location.pathname === path ? 'text-accent after:w-full' : 'after:w-0 hover:after:w-full'
  );

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 z-50 w-full border-b border-border/70 bg-primary/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src="/raino-logo.jpeg"
            alt="Raino Cars"
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="hidden font-display text-xl font-bold tracking-tight text-off-white sm:block">
            RAINO<span className="text-accent">CARS</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/cars" className={navLinkClass('/cars')}>
            Browse Cars
          </Link>
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className={navLinkClass(isAdmin ? '/admin' : '/dashboard')}
            >
              {isAdmin ? 'Admin Panel' : 'My Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/login" className={navLinkClass('/login')}>
                Login
              </Link>
              <Button variant="primary" size="sm" asChild>
                <Link to="/register">Join Now</Link>
              </Button>
            </>
          )}
          {isAuthenticated && (
            <span className="text-sm text-off-white/50">{user?.name}</span>
          )}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex h-8 w-16 items-center rounded-full border border-border bg-surface p-1 transition-colors duration-300 hover:border-accent"
            aria-label="Toggle color theme"
          >
            <div
              className={cn(
                'absolute inset-0 rounded-full bg-accent/10 opacity-0 transition-opacity duration-300',
                theme === 'light' && 'opacity-100'
              )}
            />
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-red-glow',
                theme === 'light' ? 'translate-x-8' : 'translate-x-0'
              )}
            >
              {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </motion.span>
          </button>
        </div>

        <button className="md:hidden text-off-white" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        className={cn(
          'overflow-hidden border-b border-border bg-primary/95 md:hidden',
          !isOpen && 'pointer-events-none'
        )}
      >
        <div className="flex flex-col gap-4 px-4 py-6">
          <Link to="/cars" className="text-lg text-off-white/70 hover:text-accent" onClick={() => setIsOpen(false)}>
            Browse Cars
          </Link>
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="text-lg text-off-white/70 hover:text-accent"
              onClick={() => setIsOpen(false)}
            >
              {isAdmin ? 'Admin Panel' : 'My Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-lg text-off-white/70 hover:text-accent" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Button variant="primary" className="w-full" asChild>
                <Link to="/register" onClick={() => setIsOpen(false)}>Join Now</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-10 w-full items-center justify-between rounded-full border border-border bg-surface px-3 text-sm text-off-white"
          >
            Theme
            <span className="relative flex h-7 w-14 items-center rounded-full bg-primary p-1">
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white',
                  theme === 'light' ? 'translate-x-7' : 'translate-x-0'
                )}
              >
                {theme === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              </motion.span>
            </span>
          </button>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
