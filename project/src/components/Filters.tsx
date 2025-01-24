import React from 'react';
import { Search, Filter, Calendar, ArrowDown, ArrowUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number';
  options?: { value: string; label: string }[];
}

interface FiltersProps {
  options: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onSearch?: (text: string) => void;
  searchPlaceholder?: string;
}

export default function Filters({ options, activeFilters, onFilterChange, onSearch, searchPlaceholder }: FiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch?.(value);
  };

  const handleFilterChange = (id: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value === '' || value === null) {
      delete newFilters[id];
    } else {
      newFilters[id] = value;
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
    setSearchText('');
    onSearch?.('');
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-4">
        {/* Arama */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={searchPlaceholder || "Ara..."}
            value={searchText}
            onChange={handleSearchChange}
            className="input pl-10 w-full"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        {/* Filtre Butonu */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            button-secondary flex items-center gap-2
            ${activeFilterCount > 0 ? 'text-primary' : ''}
          `}
        >
          <Filter size={20} />
          Filtreler
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Temizle Butonu */}
        {(activeFilterCount > 0 || searchText) && (
          <button
            onClick={clearFilters}
            className="button-secondary text-error"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Genişletilmiş Filtreler */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {options.map((option) => (
                <div key={option.id}>
                  <label className="block text-sm font-medium mb-1.5">
                    {option.label}
                  </label>
                  {option.type === 'select' && (
                    <select
                      value={activeFilters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Tümü</option>
                      {option.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {option.type === 'date' && (
                    <input
                      type="date"
                      value={activeFilters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      className="input w-full"
                    />
                  )}
                  {option.type === 'text' && (
                    <input
                      type="text"
                      value={activeFilters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      className="input w-full"
                    />
                  )}
                  {option.type === 'number' && (
                    <input
                      type="number"
                      value={activeFilters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      className="input w-full"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Aktif Filtreler */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(activeFilters).map(([key, value]) => {
                  const option = options.find(opt => opt.id === key);
                  if (!option) return null;

                  let label = '';
                  if (option.type === 'select') {
                    label = option.options?.find(opt => opt.value === value)?.label || value;
                  } else {
                    label = value;
                  }

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      <span>{option.label}: {label}</span>
                      <button
                        onClick={() => handleFilterChange(key, '')}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}