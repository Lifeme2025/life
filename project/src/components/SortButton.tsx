import React from 'react';
import { ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SortOption {
  id: string;
  label: string;
}

interface SortButtonProps {
  options: SortOption[];
  activeSort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onSort: (field: string, direction: 'asc' | 'desc') => void;
}

export default function SortButton({ options, activeSort, onSort }: SortButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = options.find(opt => opt.id === activeSort.field);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="button-secondary flex items-center gap-2"
      >
        {activeSort.direction === 'asc' ? (
          <ArrowUp size={18} />
        ) : (
          <ArrowDown size={18} />
        )}
        <span>{activeOption?.label || 'Sırala'}</span>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-lg ring-1 ring-black/5 z-50"
          >
            <div className="p-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    const newDirection = 
                      activeSort.field === option.id && activeSort.direction === 'asc'
                        ? 'desc'
                        : 'asc';
                    onSort(option.id, newDirection);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    ${activeSort.field === option.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-dark-surface-soft'
                    }
                  `}
                >
                  {activeSort.field === option.id ? (
                    activeSort.direction === 'asc' ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    )
                  ) : (
                    <div className="w-4" />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}