import React, { useState, useRef, useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { TournamentData, Player, RankedPlayer, Match } from './types';
import TournamentForm from './components/TournamentForm';
import ResultsCard from './components/ResultsCard';
import { generateTournamentSummary } from './services/geminiService';
import { DownloadIcon, SparklesIcon } from './components/icons';

 

     
const App: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const initialMatchId = Date.now();
    const isAiAvailable = !!process.env.API_KEY;

    const initialPlayers: Player[] = Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        matchResults: {
            [initialMatchId]: { kills: 0, placement: i + 1 }
        }
    }));

    const [tournamentData, setTournamentData] = useState<TournamentData>({
        title: "Free Fire Showdown",
        date: today,
        players: initialPlayers,
        matches: [{ id: initialMatchId, name: "Match 1" }]
    });
    
    const [activeMatchId, setActiveMatchId] = useState<number>(initialMatchId);
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    
    const cardRef = useRef<HTMLDivElement>(null);

    const getPlacementPoints = useCallback((placement: number): number => {
        if (placement === 1) return 12;
        if (placement === 2) return 9;
        if (placement === 3) return 8;
        if (placement === 4) return 7;
        if (placement === 5) return 6;
        if (placement === 6) return 5;
        if (placement === 7) return 4;
        if (placement === 8) return 3;
        if (placement === 9) return 2;
        if (placement === 10) return 1;
        return 0; // 11th and 12th (and lower) get 0 points
    }, []);

    const rankedPlayers = useMemo<RankedPlayer[]>(() => {
        if (!tournamentData.players) return [];
        return tournamentData.players
            .map(player => {
                let totalKills = 0;
                let totalPoints = 0;

                for (const matchId in player.matchResults) {
                    const result = player.matchResults[matchId];
                    if(result) {
                        const placementPoints = getPlacementPoints(result.placement);
                        totalKills += result.kills;
                        totalPoints += placementPoints + result.kills;
                    }
                }
                
                return { ...player, totalKills, totalPoints, rank: 0 };
            })
            .sort((a, b) => {
                if (b.totalPoints !== a.totalPoints) {
                    return b.totalPoints - a.totalPoints;
                }
                return b.totalKills - a.totalKills;
            })
            .map((p, index) => ({ ...p, rank: index + 1 }));
    }, [tournamentData, getPlacementPoints]);

    const addMatch = useCallback(() => {
        const newMatchId = Date.now();
        const newMatch: Match = { id: newMatchId, name: `Match ${tournamentData.matches.length + 1}`};

        setTournamentData(prev => {
            const updatedPlayers = prev.players.map(p => ({
                ...p,
                matchResults: {
                    ...p.matchResults,
                    [newMatchId]: { kills: 0, placement: prev.players.length }
                }
            }));
            return {
                ...prev,
                matches: [...prev.matches, newMatch],
                players: updatedPlayers
            };
        });
        setActiveMatchId(newMatchId);
    }, [tournamentData.matches.length]);

    const removeMatch = useCallback((matchIdToRemove: number) => {
        if (tournamentData.matches.length <= 1) {
            alert("Cannot remove the last match.");
            return;
        }

        setTournamentData(prev => {
            const newPlayers = prev.players.map(p => {
                const newMatchResults = { ...p.matchResults };
                delete newMatchResults[matchIdToRemove];
                return { ...p, matchResults: newMatchResults };
            });
            const newMatches = prev.matches.filter(m => m.id !== matchIdToRemove);
            if (activeMatchId === matchIdToRemove) {
                setActiveMatchId(newMatches[0]?.id || 0);
            }
            return { ...prev, players: newPlayers, matches: newMatches };
        });
    }, [tournamentData, activeMatchId]);

    const addPlayer = useCallback(() => {
        const newPlayer: Player = {
          id: Date.now(),
          name: `Team ${tournamentData.players.length + 1}`,
          matchResults: tournamentData.matches.reduce((acc, match) => {
            acc[match.id] = { kills: 0, placement: tournamentData.players.length + 1 };
            return acc;
          }, {} as Record<number, { kills: number, placement: number }>)
        };
        setTournamentData(prev => ({
          ...prev,
          players: [...prev.players, newPlayer],
        }));
    }, [tournamentData]);
    
    const handleBulkAddPlayers = useCallback((names: string[]) => {
        if (names.length === 0) return;
        
        const newPlayers: Player[] = names.map((name, index) => ({
            id: Date.now() + index,
            name: name,
            matchResults: tournamentData.matches.reduce((acc, match) => {
                acc[match.id] = { kills: 0, placement: 0 };
                return acc;
            }, {} as Record<number, { kills: number, placement: number }>)
        }));

        setTournamentData(prev => ({
            ...prev,
            players: newPlayers
        }));
    }, [tournamentData.matches]);


    const removePlayer = useCallback((id: number) => {
        setTournamentData(prev => ({
          ...prev,
          players: prev.players.filter(p => p.id !== id),
        }));
    }, []);


    const handleGenerateSummary = useCallback(async () => {
        if (!isAiAvailable) return;
        setIsLoadingSummary(true);
        setAiSummary('');
        const summary = await generateTournamentSummary(rankedPlayers, tournamentData.matches.length);
        setAiSummary(summary);
        setIsLoadingSummary(false);
    }, [rankedPlayers, tournamentData.matches.length, isAiAvailable]);

    const handleDownloadImage = useCallback(() => {
        if (!cardRef.current) return;
        setIsDownloading(true);
        toPng(cardRef.current, { pixelRatio: 2, quality: 1.0 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                const safeTitle = tournamentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                link.download = `${safeTitle}_overall_results.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Oops, something went wrong!', err);
                alert('Could not download image. Please try again.');
            })
            .finally(() => {
                setIsDownloading(false);
            });
    }, [cardRef, tournamentData.title]);

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="flex flex-col gap-6" style={{minHeight: '80vh'}}>
                    <TournamentForm
                        tournamentData={tournamentData}
                        setTournamentData={setTournamentData}
                        activeMatchId={activeMatchId}
                        setActiveMatchId={setActiveMatchId}
                        addMatch={addMatch}
                        removeMatch={removeMatch}
                        addPlayer={addPlayer}
                        removePlayer={removePlayer}
                        handleBulkAddPlayers={handleBulkAddPlayers}
                    />
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4">
                        <button 
                            onClick={handleGenerateSummary} 
                            disabled={!isAiAvailable || isLoadingSummary}
                            title={!isAiAvailable ? "AI features are disabled. Please provide an API key." : "Generate AI Hype Summary"}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            <SparklesIcon className="h-6 w-6"/>
                            {isLoadingSummary ? 'Generating...' : 'Generate AI Summary'}
                        </button>
                        <button 
                            onClick={handleDownloadImage}
                            disabled={isDownloading}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            <DownloadIcon className="h-6 w-6"/>
                            {isDownloading ? 'Downloading...' : 'Download as Image'}
                        </button>
                    </div>
                </div>

                <div className="flex items-start justify-center">
                    <ResultsCard
                        cardRef={cardRef}
                        tournamentData={tournamentData}
                        rankedPlayers={rankedPlayers}
                        summary={aiSummary}
                        isLoadingSummary={isLoadingSummary}
                        isAiAvailable={isAiAvailable}
                    />
                </div>

            </div>
            <footer className="text-center text-gray-500 mt-12">
                <p>all rights reserved © 2025 Free Fire Tournament Results Maker| AL REDOWAN AHMED FAHIM | Facebook <a href="https://www.facebook.com/AR.ERROR.404" target="_blank" rel="noopener noreferrer">AL REDOWAN AHMED FAHIM</a> </p>
            </footer>
        </div>
    );
};

export default App;
