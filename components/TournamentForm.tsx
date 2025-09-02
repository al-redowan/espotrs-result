import React, { useState } from 'react';
import { TournamentData, Player, Match, PlayerMatchResult } from '../types';
import { PlusIcon, TrashIcon, ClipboardIcon } from './icons';

interface TournamentFormProps {
  tournamentData: TournamentData;
  setTournamentData: React.Dispatch<React.SetStateAction<TournamentData>>;
  activeMatchId: number;
  setActiveMatchId: React.Dispatch<React.SetStateAction<number>>;
  addMatch: () => void;
  removeMatch: (matchId: number) => void;
  addPlayer: () => void;
  removePlayer: (playerId: number) => void;
  handleBulkAddPlayers: (names: string[]) => void;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ 
    tournamentData, setTournamentData, activeMatchId, setActiveMatchId, addMatch, removeMatch, addPlayer, removePlayer, handleBulkAddPlayers
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkNames, setBulkNames] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTournamentData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlayerNameChange = (id: number, value: string) => {
    setTournamentData(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === id ? { ...p, name: value } : p)
    }));
  };

  const handlePlayerMatchResultChange = (playerId: number, field: keyof PlayerMatchResult, value: string) => {
    setTournamentData(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? { 
            ...p, 
            matchResults: {
                ...p.matchResults,
                [activeMatchId]: {
                    ...p.matchResults[activeMatchId],
                    [field]: parseInt(value) || 0
                }
            }
        } : p
      ),
    }));
  };

  const handleBulkAddConfirm = () => {
    const names = bulkNames.split('\n').map(name => name.trim()).filter(name => name.length > 0);
    handleBulkAddPlayers(names);
    setIsModalOpen(false);
    setBulkNames('');
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 border border-gray-700 animate-slide-in-up">
                <h3 className="text-xl font-display text-yellow-400">Bulk Add Teams</h3>
                <p className="text-gray-400 text-sm">Paste team names, one per line. This will replace the current list of teams.</p>
                <textarea
                    className="w-full h-48 bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    placeholder="Team Alpha&#10;Team Bravo&#10;Team Charlie..."
                    value={bulkNames}
                    onChange={(e) => setBulkNames(e.target.value)}
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                    <button onClick={handleBulkAddConfirm} className="px-4 py-2 rounded-md bg-yellow-500 text-gray-900 font-bold hover:bg-yellow-600 transition-colors">Replace Teams</button>
                </div>
            </div>
        </div>
      )}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 h-full flex flex-col">
        <h2 className="text-2xl font-display text-yellow-400">Tournament Setup</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Tournament Name</label>
            <input
              type="text"
              id="title"
              name="title"
              value={tournamentData.title}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              placeholder="e.g., Summer Skirmish"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={tournamentData.date}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
            <h3 className="text-lg font-display text-gray-200">Team Management</h3>
            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105">
                    <ClipboardIcon className="h-5 w-5" />
                    <span>Bulk Add Teams</span>
                </button>
                <button onClick={addPlayer} className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Single Team</span>
                </button>
            </div>
        </div>

        <div className="flex-grow flex flex-col space-y-4 min-h-0">
          <div className="border-b border-gray-700">
              <div className="flex items-center space-x-1 -mb-px">
                  {tournamentData.matches.map(match => (
                      <button 
                          key={match.id}
                          onClick={() => setActiveMatchId(match.id)}
                          className={`py-2 px-4 text-sm font-medium rounded-t-md transition-colors duration-200 flex items-center gap-2 ${activeMatchId === match.id ? 'bg-gray-700 text-yellow-400 border-gray-700' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}
                      >
                          {match.name}
                          {tournamentData.matches.length > 1 && (
                               <span onClick={(e) => {e.stopPropagation(); removeMatch(match.id)}} className="text-gray-500 hover:text-red-500 text-xs font-mono">×</span>
                          )}
                      </button>
                  ))}
                  <button onClick={addMatch} className="ml-2 text-yellow-500 hover:bg-gray-700 rounded-full p-1.5 transition-colors">
                      <PlusIcon className="h-4 w-4" />
                  </button>
              </div>
          </div>

          <div className="flex items-center space-x-3 text-xs uppercase text-gray-400 px-3">
              <span className="w-6 text-center">#</span>
              <span className="flex-grow">Player/Team Name</span>
              <span className="w-20 text-center">Place</span>
              <span className="w-20 text-center">Kills</span>
              <span className="w-5"></span>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
              {tournamentData.players.map((player, index) => {
                  const result = player.matchResults[activeMatchId] || { placement: 0, kills: 0 };
                  return (
                  <div key={player.id} className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-lg animate-slide-in-up" style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}>
                      <span className="text-yellow-400 font-bold w-6 text-center">{index + 1}</span>
                      <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                          className="flex-grow bg-gray-600 border border-gray-500 rounded-md px-3 py-1.5 text-white focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                          placeholder="Player/Team Name"
                      />
                      <input
                          type="number"
                          value={result.placement === 0 ? '' : result.placement}
                          onChange={(e) => handlePlayerMatchResultChange(player.id, 'placement', e.target.value)}
                          className="w-20 bg-gray-600 border border-gray-500 rounded-md px-3 py-1.5 text-white focus:ring-1 focus:ring-yellow-500 focus:outline-none text-center"
                          placeholder="Place"
                          min="1"
                      />
                      <input
                          type="number"
                          value={result.kills === 0 ? '' : result.kills}
                          onChange={(e) => handlePlayerMatchResultChange(player.id, 'kills', e.target.value)}
                          className="w-20 bg-gray-600 border border-gray-500 rounded-md px-3 py-1.5 text-white focus:ring-1 focus:ring-yellow-500 focus:outline-none text-center"
                          placeholder="Kills"
                          min="0"
                      />
                      <button onClick={() => removePlayer(player.id)} className="text-red-500 hover:text-red-400 p-1.5 rounded-full bg-gray-600 hover:bg-red-500/20 transition-colors">
                          <TrashIcon className="h-5 w-5" />
                      </button>
                  </div>
              )})}
          </div>
        </div>
      </div>
    </>
  );
};

export default TournamentForm;