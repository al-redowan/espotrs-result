import React from 'react';
import { TournamentData, RankedPlayer } from '../types';
import { SparklesIcon } from './icons';

interface ResultsCardProps {
  tournamentData: TournamentData;
  rankedPlayers: RankedPlayer[];
  summary: string;
  cardRef: React.RefObject<HTMLDivElement>;
  isLoadingSummary: boolean;
  isAiAvailable: boolean;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ tournamentData, rankedPlayers, summary, cardRef, isLoadingSummary, isAiAvailable }) => {
    const matchCount = tournamentData.matches.length;
    
    // Using a CSS gradient for the background to eliminate network dependency and CORS issues.
    // This ensures reliability for the "Download as Image" feature and fixes related errors.
    const backgroundStyle = {
        background: 'linear-gradient(145deg, rgb(31, 41, 55) 0%, rgb(17, 24, 39) 100%)',
    };
    
    return (
        <div ref={cardRef} className="w-full max-w-[800px] bg-gray-900 p-2 rounded-xl shadow-2xl font-sans"
             style={backgroundStyle}>
            <div className="bg-black/70 backdrop-blur-sm p-8 rounded-lg">
                <header className="text-center mb-8">
                    <h1 className="font-display text-5xl md:text-6xl uppercase tracking-wider bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
                        Overall Standings
                    </h1>
                    <h2 className="font-display text-3xl text-gray-200 mt-2">{tournamentData.title}</h2>
                    <p className="text-gray-400">{tournamentData.date} ({matchCount} {matchCount > 1 ? 'Matches' : 'Match'})</p>
                </header>

                <main className="mb-8">
                    <div className="grid grid-cols-12 text-xs sm:text-sm font-bold text-yellow-400 uppercase tracking-wider px-4 py-2 border-b-2 border-yellow-400/30">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">Player</div>
                        <div className="col-span-2 text-center">Total Kills</div>
                        <div className="col-span-3 text-right">Total Points</div>
                    </div>
                    <ul className="space-y-1 mt-2">
                        {rankedPlayers.slice(0, 12).map((player, index) => (
                            <li key={player.id} className={`flex items-center rounded-md px-4 py-3 grid grid-cols-12 gap-2 text-sm md:text-base transition-all duration-300 ${
                                index === 0 ? 'bg-yellow-500/20 scale-105 shadow-lg' : 
                                index === 1 ? 'bg-gray-400/20' : 
                                index === 2 ? 'bg-orange-600/20' : 
                                'bg-gray-800/50'
                            } animate-slide-in-up`} style={{ animationDelay: `${index * 70}ms`, opacity: 0 }}>
                                <div className={`col-span-1 font-display text-xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                                    {player.rank}
                                </div>
                                <div className="col-span-6 font-bold truncate">{player.name}</div>
                                <div className="col-span-2 text-center text-red-500 font-semibold">{player.totalKills}</div>
                                <div className="col-span-3 text-right font-bold text-cyan-400">{player.totalPoints}</div>
                            </li>
                        ))}
                    </ul>
                </main>

                <footer className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-display text-xl text-yellow-400 mb-2 flex items-center gap-2"><SparklesIcon className="w-6 h-6"/> AI Hype Summary</h3>
                    {isLoadingSummary ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            <p className="text-gray-300">Generating epic commentary...</p>
                        </div>
                    ) : (
                         <p className="text-gray-300 leading-relaxed animate-fade-in">
                            {summary || (isAiAvailable ? "Click 'Generate AI Summary' to create epic commentary!" : "AI Summary requires a configured API key.")}
                        </p>
                    )}
                </footer>
                
                <div className="text-center mt-6">
                    <p className="font-display text-lg text-white">BOOYAH!</p>
                </div>
            </div>
        </div>
    );
};

export default ResultsCard;
