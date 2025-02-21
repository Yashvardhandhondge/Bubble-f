import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  Plus, 
  SlidersHorizontal, 
  X,
  Menu 
} from 'lucide-react';
import { FaTelegram } from "react-icons/fa";
import { useData } from '../context/DataContext';
import WalletConnect from './WalletConnect';
import { useAccount } from 'wagmi';
import { ChangellyDEX } from './ChangellyDEX';
import { ErrorBoundary } from './ErrorBoundary';

interface Filters {
  skipTraps: boolean;
  avoidHype: boolean;
  minMarketCap: boolean;
}

interface Strategy {
  id: string;
  name: string;
  type: 'short' | 'long' | 'rsi';
  filters?: {
    skipTraps?: boolean;
    avoidHype?: boolean;
    minMarketCap?: number;
  };
}

interface Token {
  id: string;
  name: string;
  type: 'binance' | 'BTCC' | 'ai';
}

interface NavbarProps {
  onRangeChange: (range: string) => void;
  onStrategyChange?: (strategy: Strategy) => void;
  onTokenSourceChange?: (source: Token['type']) => void;
}

export const Navbar = ({ 
  onRangeChange, 
  onStrategyChange,
  onTokenSourceChange 
}: NavbarProps) => {
  const { filters, updateFilters, setCurrentToken } = useData();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Top 100");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStrategyId, setActiveStrategyId] = useState('1');
  const [selectedTokenType, setSelectedTokenType] = useState<'binance' | 'BTCC' | 'ai'>('binance');
  const [activeFilterStrategyId, setActiveFilterStrategyId] = useState<string | null>(null);
  const { address } = useAccount();
  const [showDEX, setShowDEX] = useState(false);

  // Internal filter state to match with context
  const [filterOptions, setFilterOptions] = useState({
    skipTraps: filters.skipPotentialTraps || false,
    avoidHype: filters.avoidOverhypedTokens || false,
    minMarketCap: filters.marketCapFilter || false,
  });

  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>([
    { id: '1', name: 'Short-Term', type: 'short' },
    { id: '2', name: 'Long-Term', type: 'long' }
  ]);

  const [selectedTokens, setSelectedTokens] = useState<Token[]>([
    { id: '1', name: 'Binance', type: 'binance' },
    { id: '2', name: 'BTCC', type: 'BTCC' }
  ]);

  const allStrategies: Strategy[] = [
    { id: '1', name: 'Short-Term', type: 'short' },
    { id: '2', name: 'Long-Term', type: 'long' },
    { id: '3', name: 'RSI', type: 'rsi' }
  ];

  const allTokens: Token[] = [
    { id: '1', name: 'Binance', type: 'binance' },
    { id: '2', name: 'BTCC', type: 'BTCC' },
    { id: '3', name: 'AI Agents', type: 'ai' }
  ];

  // Sync internal filter state with context
  useEffect(() => {
    setFilterOptions({
      skipTraps: filters.skipPotentialTraps || false,
      avoidHype: filters.avoidOverhypedTokens || false, 
      minMarketCap: filters.marketCapFilter || false
    });
  }, [filters]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (target.closest('.filters-dropdown') || 
          (target.closest('.filters-button') && !showFilters)) {
        return;
      }

      if (!target.closest('.dropdown-container')) {
        setShowRankDropdown(false);
        setShowStrategySelector(false);
        setShowTokenSelector(false);
        if (!target.closest('.filters-button') && !target.closest('.strategy-filter-container')) {
          setShowFilters(false);
          setActiveFilterStrategyId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    setShowRankDropdown(false);
    onRangeChange(range);
  };

  const toggleStrategy = (event: React.MouseEvent, strategy: Strategy) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Toggling strategy:', strategy.name);
    
    const isSelected = selectedStrategies.some(s => s.id === strategy.id);
    if (!isSelected) {
      const newStrategies = [...selectedStrategies, strategy];
      console.log('New strategies:', newStrategies);
      setSelectedStrategies(newStrategies);
      setActiveStrategyId(strategy.id);
      onStrategyChange?.(strategy);
    }
    
    setShowStrategySelector(false);
  };

  const toggleToken = (token: Token) => {
    setSelectedTokenType(token.type);
    if (!selectedTokens.find(t => t.id === token.id)) {
      const updatedTokens = [...selectedTokens, token];
      setSelectedTokens(updatedTokens);
      onTokenSourceChange?.(token.type);
    }
  };

  // Fixed handleFilterClick function
  const handleFilterClick = (strategyId: string, event: React.MouseEvent) => {
    // This is critical to prevent the parent button's onClick from firing
    event.preventDefault();
    event.stopPropagation();
    console.log('Filter clicked for strategy:', strategyId);
    
    if (activeFilterStrategyId === strategyId) {
      setShowFilters(false);
      setActiveFilterStrategyId(null);
    } else {
      setShowFilters(true);
      setActiveFilterStrategyId(strategyId);
    }
  };

  // Update handleFilterOptionClick to properly set context filters
  const handleFilterOptionClick = (filterKey: keyof typeof filterOptions, value: boolean) => {
    const newFilterOptions = {
      ...filterOptions,
      [filterKey]: value
    };
    
    setFilterOptions(newFilterOptions);
    
    // Map to context filter names
    const contextFilters = {
      skipPotentialTraps: newFilterOptions.skipTraps,
      avoidOverhypedTokens: newFilterOptions.avoidHype,
      marketCapFilter: newFilterOptions.minMarketCap
    };
    
    updateFilters(contextFilters);
  };

  return (
    <div className="flex flex-col w-full bg-gray-900">
      <div className="flex flex-col h-16 lg:flex-row items-center justify-between p-4 bg-gray-800/50">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <img
            src="/fav.png"
            alt="Coinchart.fun"
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
          />
          <span className="text-xl lg:text-2xl font-bold text-white">Coinchart.fun</span>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Crypto..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg
                border border-gray-700 focus:border-blue-500 focus:outline-none
                placeholder-gray-500"
            />
          </div>

          {/* Range Selector */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowRankDropdown(!showRankDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 w-full lg:w-auto justify-center"
            >
              {selectedRange}
              <ChevronDown size={20} />
            </button>

            {showRankDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
                <div className="p-2 space-y-1">
                  {["Top 100", "101 - 200", "201 - 300", "301 - 400"].map((range) => (
                    <label
                      key={range}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => handleRangeChange(range)}
                    >
                      <input
                        type="radio"
                        name="rank"
                        className="text-blue-500"
                        checked={selectedRange === range}
                        onChange={() => handleRangeChange(range)}
                      />
                      <span className="text-white">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
         
          <a 
            href="http://t.me/adamwernee" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white hover:text-white whitespace-nowrap"
          >
            API Access
            <FaTelegram size={14} className="text-blue-400" />
          </a>
        </div>
        
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 text-gray-400 hover:text-white"
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Add Wallet Connect button */}
        <div className="flex items-center gap-4">
          <WalletConnect />
          <button
            onClick={() => setShowDEX(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open DEX
          </button>
        </div>
      </div>

   
      <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-start p-3 bg-black space-y-4 lg:space-y-0 ${showMobileMenu ? '' : 'hidden lg:flex'}`}>
     
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto">
          <span className="text-white whitespace-nowrap">Strategies:</span>
          <div className="flex flex-wrap gap-2 relative">
            {selectedStrategies.map(strategy => (
              <div key={strategy.id} className="relative strategy-filter-container">
                {/* Strategy button - separate from filter button */}
                <button
                  onClick={() => {
                    console.log('Strategy button clicked:', strategy);
                    setActiveStrategyId(strategy.id);
                    onStrategyChange?.(strategy);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors
                    ${strategy.id === activeStrategyId 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {strategy.name}
                  {strategy.type === 'short' && (
                    <span 
                      className="filters-button ml-1 cursor-pointer"
                      onClick={(e) => handleFilterClick(strategy.id, e)}
                    >
                      <SlidersHorizontal size={18} />
                    </span>
                  )}
                </button>
                
                {/* Filter dropdown for short-term strategy */}
                {showFilters && activeFilterStrategyId === strategy.id && strategy.type === 'short' && (
                  <div className="absolute left-0 top-10 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-50 filters-dropdown">
                    <div className="p-3 space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <h3 className="text-white font-medium">Filter Options</h3>
                        <button 
                          onClick={() => {
                            setShowFilters(false);
                            setActiveFilterStrategyId(null);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-gray-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={filterOptions.skipTraps}
                            onChange={(e) => handleFilterOptionClick('skipTraps', e.target.checked)}
                            className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          Skip Potential Traps
                        </label>
                        
                        <label className="flex items-center gap-2 text-gray-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={filterOptions.avoidHype}
                            onChange={(e) => handleFilterOptionClick('avoidHype', e.target.checked)}
                            className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          Avoid Overhyped Tokens
                        </label>
                        
                        <label className="flex items-center gap-2 text-gray-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={filterOptions.minMarketCap}
                            onChange={(e) => handleFilterOptionClick('minMarketCap', e.target.checked)}
                            className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          Min Market Cap Filter
                        </label>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-700 flex justify-end">
                        <button
                          onClick={() => {
                            setShowFilters(false);
                            setActiveFilterStrategyId(null);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Directly render RSI button if it is not already selected */}
            {allStrategies
              .filter(strategy => strategy.type === 'rsi' && !selectedStrategies.some(s => s.type === 'rsi'))
              .map(rsiStrategy => (
                <div key={rsiStrategy.id} className="relative inline-flex items-center">
                  <button
                    onClick={() =>
                      setSelectedStrategies(prev => [...prev, rsiStrategy])
                    }
                    className="px-4 py-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    {rsiStrategy.name}
                  </button>
                </div>
              ))}
          </div>
        </div>

      
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0 lg:ml-8">
          <span className="text-white whitespace-nowrap">Tokens:</span>
          <div className="flex flex-wrap gap-2">
            {allTokens.map(token => (
              <button
                key={token.id}
                onClick={() => {
                  // Update the token selection by mapping 'ai' to "cookiefun"
                  setCurrentToken(token.type === 'ai' ? "cookiefun" : token.type.toLowerCase());
                  setSelectedTokenType(token.type);
                  onTokenSourceChange?.(token.type);
                }}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  selectedTokenType === token.type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {token.name}
              </button>
            ))}
          </div>
        </div>

    
        {showStrategySelector && (
          <div className="absolute left-72 top-36 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {allStrategies.map(strategy => (
                <button
                  key={strategy.id}
                  onClick={(e) => toggleStrategy(e, strategy)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedStrategies.some(s => s.id === strategy.id)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {strategy.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Use new ChangellyDEX component */}
      {showDEX && (
        <ErrorBoundary>
          <ChangellyDEX onClose={() => setShowDEX(false)} />
        </ErrorBoundary>
      )}
    </div>
  );
}