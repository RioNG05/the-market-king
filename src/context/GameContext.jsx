import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  generateInitialAIs,
  runAIProduction,
  runAIPricing,
  distributeMarketDemand,
  generateRandomEvent,
  EVENTS
} from '../utils/economicEngine';

const GameContext = createContext();

// Sound effects using Web Audio API
export const playSound = (type, enabled = true) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'cash') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'upgrade') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.4);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'event') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(440, now + 0.15);
      osc.frequency.setValueAtTime(220, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'victory') {
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.08, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.5);
      });
    } else if (type === 'defeat') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.8);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    console.error('Audio synthesis failed:', e);
  }
};

export const GameProvider = ({ children }) => {
  // Game setup
  const [teamName, setTeamName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  // Core game states
  const [funds, setFunds] = useState(10000);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState('setup'); // setup, production, sales, report, gameover
  const [event, setEvent] = useState(EVENTS.STABLE);

  // Player manufacturing stats
  const [materials, setMaterials] = useState(0);
  const [workers, setWorkers] = useState(1);
  const [upgraded, setUpgraded] = useState(false);
  const [shoesInStock, setShoesInStock] = useState(0);

  // Price setting
  const [salesPrice, setSalesPrice] = useState(35);

  // Simulation variables
  const [materialPrice, setMaterialPrice] = useState(10);
  const [workerWage] = useState(500);
  const [aiCompetitors, setAiCompetitors] = useState([]);
  
  // Results and history
  const [roundResult, setRoundResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameResultStatus, setGameResultStatus] = useState(null); // 'win' or 'bankrupt' or 'lose'

  // Timer states
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Load leaderboard on mount
  useEffect(() => {
    const saved = localStorage.getItem('market_king_leaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (timerActive && timerEnabled && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Auto submit when time runs out
      if (phase === 'production') {
        submitProduction();
      } else if (phase === 'sales') {
        submitSales();
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, timerActive, phase, timerEnabled]);

  // Start the game
  const startGame = (name, diff, useTimer) => {
    const formattedName = name.trim() || 'Xưởng Vô Danh';
    setTeamName(formattedName);
    setDifficulty(diff);
    setTimerEnabled(useTimer);

    // Set starting funds based on difficulty
    let startFunds = 10000;
    if (diff === 'easy') startFunds = 12000;
    if (diff === 'hard') startFunds = 8000;

    setFunds(startFunds);
    setRound(1);
    setPhase('production');
    setEvent(EVENTS.STABLE);
    setMaterialPrice(10);
    setMaterials(0);
    setWorkers(1);
    setUpgraded(false);
    setShoesInStock(0);
    setSalesPrice(35);
    setHistory([]);
    setRoundResult(null);
    setGameResultStatus(null);
    setAiCompetitors(generateInitialAIs());

    // Reset timer
    setTimeLeft(30);
    setTimerActive(useTimer);
  };

  // Hire a worker
  const hireWorker = () => {
    setWorkers(prev => prev + 1);
  };

  // Fire a worker
  const fireWorker = () => {
    setWorkers(prev => Math.max(1, prev - 1));
  };

  // Buy raw materials
  const buyMaterials = (amount) => {
    const cost = amount * materialPrice;
    const wagesReserved = workers * workerWage;
    
    // Player cannot spend past their current liquid funds (reserving wages is safe)
    if (cost > funds - wagesReserved) {
      playSound('error', soundOn);
      return false;
    }

    setFunds(prev => prev - cost);
    setMaterials(prev => prev + amount);
    playSound('cash', soundOn);
    return true;
  };

  // Sell materials back at a 20% loss (in case they made a mistake)
  const sellMaterialsBack = (amount) => {
    if (materials < amount) return false;
    const refund = Math.floor(amount * materialPrice * 0.8);
    setMaterials(prev => prev - amount);
    setFunds(prev => prev + refund);
    playSound('cash', soundOn);
    return true;
  };

  // Upgrade Sewing Machine
  const upgradeSewingMachine = () => {
    const cost = 3000;
    const wagesReserved = workers * workerWage;
    if (upgraded || funds - cost < wagesReserved) {
      playSound('error', soundOn);
      return false;
    }

    setUpgraded(true);
    setFunds(prev => prev - cost);
    playSound('upgrade', soundOn);
    return true;
  };

  // Submit production setup
  const submitProduction = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);

    // Productivity metrics
    const laborTime = upgraded ? 0.5 : 2.0;
    const capacityPerWorker = Math.floor(480 / laborTime);
    const maxCapacity = workers * capacityPerWorker;

    // Actual shoes produced
    const produced = Math.min(materials, maxCapacity);
    
    // Wages deduction
    const totalWages = workers * workerWage;
    const fundsAfterWages = funds - totalWages;

    // Consuming materials
    const updatedMaterials = materials - produced;
    const totalStock = shoesInStock + produced;

    // Save temporary details for the round report
    const c_materials = produced * materialPrice;
    const v_wages = totalWages;
    const constantAmortization = upgraded ? 3000 / 15 : 0; // Machinery amortized cost per round
    
    const organicRatio = v_wages > 0 ? ((c_materials + constantAmortization) / v_wages).toFixed(2) : '0.00';
    
    const prodCosts = {
      produced,
      wagesCost: v_wages,
      materialsCost: c_materials,
      totalCost: c_materials + v_wages,
      organicRatio,
      laborTime
    };

    // Apply states
    setMaterials(updatedMaterials);
    setShoesInStock(totalStock);
    setFunds(fundsAfterWages);
    setRoundResult(prev => ({
      ...prev,
      production: prodCosts
    }));

    // Generate AI production for this round
    const updatedAIs = runAIProduction(aiCompetitors, materialPrice, workerWage);
    setAiCompetitors(updatedAIs);

    // Move to sales price setting phase
    setPhase('sales');
    setTimeLeft(30);
    setTimerActive(timerEnabled);
  };

  // Submit selling price and run simulation
  const submitSales = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);

    // Run AI pricing first
    const pricedAIs = runAIPricing(aiCompetitors, event);

    // Perform supply & demand distribution
    // Base market demand = 1000 pairs
    const baseMarketDemand = 1000;
    const simulationResult = distributeMarketDemand(
      {
        name: `${teamName} (Bạn)`,
        price: salesPrice,
        stock: shoesInStock
      },
      pricedAIs,
      baseMarketDemand,
      event
    );

    const { playerSales, playerUnsold, aiResults } = simulationResult;

    // Calculate financials
    const revenue = playerSales * salesPrice;
    const holdingCost = playerUnsold * 1; // $1 holding cost per shoe
    const endingFunds = funds + revenue - holdingCost;

    // Net profit for player
    const productionCost = roundResult.production.materialsCost; // wages was paid separately but is part of costs
    const totalCostOfSold = (playerSales * (productionCost / (roundResult.production.produced || 1))) + (playerSales * (roundResult.production.wagesCost / (roundResult.production.produced || 1)));
    const netProfit = revenue - (roundResult.production.totalCost) - holdingCost;

    const salesStats = {
      price: salesPrice,
      sales: playerSales,
      unsold: playerUnsold,
      revenue,
      holdingCost,
      netProfit,
      costOfSold: totalCostOfSold
    };

    setShoesInStock(playerUnsold);
    setFunds(endingFunds);
    setAiCompetitors(aiResults);

    const updatedResult = {
      ...roundResult,
      sales: salesStats,
      playerStateSnapshot: {
        fundsBefore: funds + roundResult.production.wagesCost, // before wages were deducted
        fundsAfter: endingFunds,
        round
      },
      aiCompetitorsSnapshot: pricedAIs.map(ai => ({
        ...ai,
        stockBefore: ai.stock
      })),
      aiResultsSnapshot: aiResults,
      eventSnapshot: event
    };

    setRoundResult(updatedResult);

    // Save to history
    const newHistory = [...history, updatedResult];
    setHistory(newHistory);

    // Check Win/Loss conditions
    if (endingFunds <= 0) {
      // Bankruptcy
      setGameResultStatus('bankrupt');
      setPhase('gameover');
      playSound('defeat', soundOn);
      saveLeaderboard(formattedResult(false, endingFunds));
    } else if (round === 15) {
      // End of 15 quarters
      const won = endingFunds >= 100000;
      setGameResultStatus(won ? 'win' : 'lose');
      setPhase('gameover');
      playSound(won ? 'victory' : 'defeat', soundOn);
      saveLeaderboard(formattedResult(won, endingFunds));
    } else {
      // Continue to report
      setPhase('report');
      playSound('cash', soundOn);
    }
  };

  const formattedResult = (won, finalFunds) => {
    return {
      teamName,
      difficulty,
      finalFunds,
      round,
      won,
      date: new Date().toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Next round preparation
  const startNextRound = () => {
    const nextRoundNum = round + 1;
    setRound(nextRoundNum);

    // Roll random macro event
    const nextEvent = generateRandomEvent(nextRoundNum);
    setEvent(nextEvent);

    // Play event alert sound if anything bad/good happens
    if (nextEvent.id !== 'STABLE') {
      playSound('event', soundOn);
    }

    // Set raw material prices
    const nextMaterialPrice = Math.round(10 * nextEvent.costMultiplier);
    setMaterialPrice(nextMaterialPrice);

    // Set phase back to production
    setPhase('production');
    setTimeLeft(30);
    setTimerActive(timerEnabled);
  };

  // Helper to save to leaderboard
  const saveLeaderboard = (entry) => {
    const currentList = [...leaderboard, entry];
    // Sort leaderboard by won state (true first), then by final funds descending, then by round descending
    currentList.sort((a, b) => {
      if (a.won !== b.won) return a.won ? -1 : 1;
      if (a.finalFunds !== b.finalFunds) return b.finalFunds - a.finalFunds;
      return b.round - a.round;
    });

    // Keep top 20
    const top20 = currentList.slice(0, 20);
    setLeaderboard(top20);
    localStorage.setItem('market_king_leaderboard', JSON.stringify(top20));
  };

  // Clear leaderboard
  const clearLeaderboard = () => {
    setLeaderboard([]);
    localStorage.removeItem('market_king_leaderboard');
  };

  // Quit and restart
  const resetToSetup = () => {
    setPhase('setup');
    setRound(1);
    setFunds(10000);
    setHistory([]);
    setRoundResult(null);
    setTimerActive(false);
  };

  return (
    <GameContext.Provider
      value={{
        teamName,
        difficulty,
        timerEnabled,
        soundOn,
        setSoundOn,
        funds,
        round,
        phase,
        event,
        materials,
        workers,
        upgraded,
        shoesInStock,
        salesPrice,
        materialPrice,
        workerWage,
        aiCompetitors,
        roundResult,
        history,
        leaderboard,
        gameResultStatus,
        timeLeft,
        setSalesPrice,
        startGame,
        hireWorker,
        fireWorker,
        buyMaterials,
        sellMaterialsBack,
        upgradeSewingMachine,
        submitProduction,
        submitSales,
        startNextRound,
        resetToSetup,
        clearLeaderboard
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
