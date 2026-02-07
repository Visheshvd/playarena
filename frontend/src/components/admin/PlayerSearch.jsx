import { useState, useEffect, useRef } from 'react';

function PlayerSearch({ label, value, onChange, placeholder, required, exclude }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load players from parent component via value
    if (value && value.players) {
      setPlayers(value.players);
    }
  }, [value]);

  useEffect(() => {
    // Find selected player by ID
    if (value && value.selectedId && players.length > 0) {
      const player = players.find(p => p._id === value.selectedId);
      setSelectedPlayer(player);
    }
  }, [value, players]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlayers = players.filter(player => {
    if (exclude && player._id === exclude) return false;
    const search = searchTerm.toLowerCase();
    return (
      player.name.toLowerCase().includes(search) ||
      player.mobile.includes(search)
    );
  });

  const handleSelect = (player) => {
    setSelectedPlayer(player);
    setSearchTerm('');
    setIsOpen(false);
    onChange(player);
  };

  const handleClear = () => {
    setSelectedPlayer(null);
    setSearchTerm('');
    onChange(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-cyan-400 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        {selectedPlayer ? (
          <div className="flex items-center justify-between bg-gray-900 border border-cyan-500/30 rounded-lg px-4 py-2.5">
            <div>
              <p className="text-white font-medium">{selectedPlayer.name}</p>
              <p className="text-sm text-gray-400">{selectedPlayer.mobile}</p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-red-400 hover:text-red-300 ml-2"
            >
              ✕
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || 'Search player by name or mobile...'}
            className="w-full bg-gray-900 border border-cyan-500/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            required={required}
          />
        )}

        {isOpen && !selectedPlayer && (
          <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredPlayers.length > 0 ? (
              <ul>
                {filteredPlayers.map((player) => (
                  <li
                    key={player._id}
                    onClick={() => handleSelect(player)}
                    className="px-4 py-3 hover:bg-cyan-500/10 cursor-pointer border-b border-gray-800 last:border-0"
                  >
                    <p className="text-white font-medium">{player.name}</p>
                    <p className="text-sm text-gray-400">{player.mobile}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-gray-400 text-center">
                {searchTerm ? 'No players found' : 'Start typing to search...'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerSearch;
