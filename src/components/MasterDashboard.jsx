import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { database } from '../firebase';
import { ref, set, onValue, update } from 'firebase/database';
import { generateRandomEvent, EVENTS } from '../utils/economicEngine';

function MasterDashboard() {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    
    // Create room if not exists
    set(roomRef, {
      phase: 'setup', // setup, production, sales, report
      round: 1,
      event: EVENTS.STABLE,
      market: {
        averagePrice: 0,
        totalDemand: 0,
        totalSupply: 0
      },
      createdAt: Date.now()
    });

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        const p = data.players || {};
        setPlayers(p);
        
        // Compute leaderboard
        const pArray = Object.entries(p).map(([id, pData]) => ({ id, ...pData }));
        pArray.sort((a, b) => b.funds - a.funds);
        setLeaderboard(pArray.slice(0, 5)); // Top 5
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const joinLink = `${window.location.origin}/#/play/${roomId}`; // Assuming hash router or similar, we will use HashRouter to avoid Vercel 404s on refresh.

  const advancePhase = () => {
    if (!roomData) return;
    
    const roomRef = ref(database, `rooms/${roomId}`);
    let nextPhase = 'setup';
    let updates = {};

    if (roomData.phase === 'setup') {
      nextPhase = 'production';
      // Initialize players
      const playerUpdates = {};
      Object.keys(players).forEach(pid => {
        playerUpdates[`players/${pid}/productionReady`] = false;
        playerUpdates[`players/${pid}/salesReady`] = false;
        playerUpdates[`players/${pid}/shoesProduced`] = 0;
        playerUpdates[`players/${pid}/shoesInStock`] = players[pid].shoesInStock || 0;
      });
      updates = { ...playerUpdates, phase: nextPhase, round: 1 };
      
    } else if (roomData.phase === 'production') {
      nextPhase = 'sales';
      updates = { phase: nextPhase };
      
    } else if (roomData.phase === 'sales') {
      // Market Aggregation Algorithm
      nextPhase = 'report';
      
      // Calculate Total Supply
      let totalSupply = 0;
      let submittedPrices = [];
      
      const pArray = Object.entries(players).map(([id, p]) => {
        const prod = p.shoesProduced || 0;
        const stock = p.shoesInStock || 0;
        const totalAvail = prod + stock;
        totalSupply += totalAvail;
        
        const price = p.price || 35; // Default price if missed
        if (totalAvail > 0) submittedPrices.push(price);
        
        return { id, totalAvail, price, data: p };
      });
      
      // Calculate Average Price
      const avgPrice = submittedPrices.length > 0 
        ? submittedPrices.reduce((a, b) => a + b, 0) / submittedPrices.length 
        : 35;
        
      // Generate Demand based on event
      // Base demand is proportional to number of players (e.g. 50 pairs per player base)
      const baseDemandPerPlayer = 80;
      const eventMultiplier = roomData.event?.demandMultiplier || 1.0;
      let totalDemand = Math.floor(Object.keys(players).length * baseDemandPerPlayer * eventMultiplier);
      
      // Distribute Sales: prioritize lower price
      pArray.sort((a, b) => a.price - b.price);
      
      const playerUpdates = {};
      let demandLeft = totalDemand;
      
      pArray.forEach(p => {
        let sold = 0;
        if (p.totalAvail > 0) {
          if (demandLeft >= p.totalAvail) {
            sold = p.totalAvail;
            demandLeft -= p.totalAvail;
          } else if (demandLeft > 0) {
            // Partial sell, maybe give more to cheaper ones? Actually strict priority.
            sold = demandLeft;
            demandLeft = 0;
          } else {
            sold = 0;
          }
          
          // Exception: If they price WAY above average (e.g. > 150%), they sell nothing
          if (p.price > avgPrice * 1.5 && p.id !== 'AI') {
             sold = 0;
             // Give demand back? 
             demandLeft += p.totalAvail; // This demand is lost
          }
        }
        
        const revenue = sold * p.price;
        const unsold = p.totalAvail - sold;
        const holdingCost = unsold * 1; // $1 holding cost
        const finalFunds = p.data.funds + revenue - holdingCost;
        
        playerUpdates[`players/${p.id}/lastResult`] = {
          sold,
          unsold,
          revenue,
          holdingCost,
          profit: revenue - holdingCost // Gross profit for this round step
        };
        playerUpdates[`players/${p.id}/shoesInStock`] = unsold;
        playerUpdates[`players/${p.id}/funds`] = finalFunds;
      });
      
      updates = { 
        ...playerUpdates, 
        phase: nextPhase,
        'market/averagePrice': avgPrice,
        'market/totalDemand': totalDemand,
        'market/totalSupply': totalSupply
      };
      
    } else if (roomData.phase === 'report') {
      if (roomData.round >= 15) {
        nextPhase = 'gameover';
        updates = { phase: nextPhase };
      } else {
        nextPhase = 'production';
        const nextRound = roomData.round + 1;
        const nextEvent = generateRandomEvent(nextRound);
        
        // Reset player readiness
        const playerUpdates = {};
        Object.keys(players).forEach(pid => {
          playerUpdates[`players/${pid}/productionReady`] = false;
          playerUpdates[`players/${pid}/salesReady`] = false;
        });
        
        updates = { ...playerUpdates, phase: nextPhase, round: nextRound, event: nextEvent };
      }
    }

    update(roomRef, updates);
  };

  if (!roomData) return <div className="p-10 text-center text-cyan-500">Đang tạo phòng...</div>;

  const playerList = Object.entries(players);
  const readyCount = playerList.filter(([id, p]) => 
    roomData.phase === 'production' ? p.productionReady : (roomData.phase === 'sales' ? p.salesReady : false)
  ).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white bg-black cyber-grid relative">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-neutral-900 border-b border-cyan-500 shadow-lg shadow-cyan-500/20">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
            MÀN HÌNH TỔNG
          </h1>
          <p className="text-neutral-400 font-mono text-sm">Quý {roomData.round}/15 | Sự kiện: <span className="text-yellow-400">{roomData.event?.name || 'Bình ổn'}</span></p>
        </div>
        <div className="flex items-center space-x-6">
           <div className="text-right hidden md:block">
             <div className="text-xs text-neutral-400">Tham gia tại: <span className="text-cyan-400">{window.location.host}</span></div>
             <div className="text-xs text-neutral-400">Mã phòng: <span className="text-2xl font-mono text-white bg-neutral-800 px-2 rounded tracking-widest">{roomId}</span></div>
           </div>
           <div className="bg-white p-1 rounded-lg">
             <QRCodeSVG value={joinLink} size={80} />
           </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Player List & Leaderboard */}
        <div className="w-1/4 min-w-[250px] border-r border-neutral-800 bg-neutral-950 flex flex-col">
          <div className="p-3 border-b border-neutral-800 bg-neutral-900 font-bold text-cyan-400 flex justify-between">
            <span>Người chơi ({playerList.length})</span>
            {['production', 'sales'].includes(roomData.phase) && (
              <span className="text-pink-400">{readyCount}/{playerList.length} Đã nộp</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm font-mono">
            {playerList.map(([id, p]) => {
              const isReady = roomData.phase === 'production' ? p.productionReady : (roomData.phase === 'sales' ? p.salesReady : false);
              return (
                <div key={id} className="flex justify-between items-center p-2 rounded bg-black border border-neutral-800">
                  <span className="truncate">{p.name}</span>
                  {['production', 'sales'].includes(roomData.phase) && (
                    <span className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500 shadow-[0_0_8px_#39ff14]' : 'bg-neutral-600'}`}></span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Leaderboard Top 5 */}
          <div className="h-1/3 border-t border-neutral-800 bg-black flex flex-col">
            <div className="p-2 bg-neutral-900 font-bold text-yellow-400 text-center text-sm">🏆 TOP 5 ĐẠI GIA</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 text-sm">
               {leaderboard.map((p, idx) => (
                 <div key={p.id} className="flex justify-between items-center px-2 py-1 bg-neutral-950 rounded border border-neutral-800">
                   <span><span className="text-neutral-500 mr-2">#{idx+1}</span>{p.name}</span>
                   <span className="text-green-400">${p.funds?.toLocaleString()}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Right Content - Main Stage */}
        <div className="flex-1 p-6 flex flex-col justify-center items-center relative">
          
          {roomData.phase === 'setup' && (
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-black glow-text-cyan">PHÒNG CHỜ</h2>
              <p className="text-xl text-neutral-400">Sinh viên hãy quét mã QR góc phải để vào phòng</p>
              <div className="text-8xl font-mono animate-pulse-fast text-pink-500">{playerList.length}</div>
              <p className="text-sm text-neutral-500 uppercase tracking-widest">Người đã kết nối</p>
            </div>
          )}

          {roomData.phase === 'production' && (
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-cyan-400">GIAI ĐOẠN 1: SẢN XUẤT</h2>
              <div className="card bg-neutral-900 border border-neutral-700 p-8 max-w-lg mx-auto">
                <p className="text-lg">Sinh viên đang tiến hành mua nguyên liệu, thuê công nhân và sản xuất giày.</p>
                <div className="mt-6">
                  <div className="text-6xl font-mono text-pink-500 mb-2">{readyCount} / {playerList.length}</div>
                  <p className="text-sm text-neutral-400">Đã nộp bài</p>
                </div>
              </div>
            </div>
          )}

          {roomData.phase === 'sales' && (
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-yellow-400">GIAI ĐOẠN 2: ĐỊNH GIÁ BÁN</h2>
              <div className="card bg-neutral-900 border border-neutral-700 p-8 max-w-lg mx-auto">
                <p className="text-lg">Sản xuất hoàn tất. Sinh viên đang đặt giá bán cho sản phẩm của mình.</p>
                <div className="mt-6">
                  <div className="text-6xl font-mono text-yellow-500 mb-2">{readyCount} / {playerList.length}</div>
                  <p className="text-sm text-neutral-400">Đã chốt giá</p>
                </div>
              </div>
            </div>
          )}

          {roomData.phase === 'report' && (
            <div className="w-full max-w-4xl space-y-6">
              <h2 className="text-4xl font-bold text-center text-green-400">BÁO CÁO THỊ TRƯỜNG QUÝ {roomData.round}</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="card cyber-panel p-6 text-center">
                  <div className="text-sm text-neutral-400 mb-2">Tổng Cung (Cả lớp)</div>
                  <div className="text-4xl font-mono text-cyan-400">{roomData.market?.totalSupply || 0}</div>
                </div>
                <div className="card cyber-panel p-6 text-center">
                  <div className="text-sm text-neutral-400 mb-2">Tổng Cầu (Thị trường)</div>
                  <div className="text-4xl font-mono text-pink-400">{roomData.market?.totalDemand || 0}</div>
                </div>
                <div className="card cyber-panel p-6 text-center">
                  <div className="text-sm text-neutral-400 mb-2">Giá Bán Trung Bình</div>
                  <div className="text-4xl font-mono text-yellow-400">${roomData.market?.averagePrice?.toFixed(1) || 0}</div>
                </div>
              </div>
              <div className="bg-neutral-900 p-6 border border-neutral-800 rounded text-center">
                <p className="text-lg mb-4 text-cyan-300">Những xưởng bán giá RẺ HƠN mức trung bình sẽ ưu tiên được phân phối hàng trước.</p>
                <p className="text-neutral-400">Hãy kiểm tra kết quả chi tiết trên điện thoại của bạn!</p>
              </div>
            </div>
          )}

          {roomData.phase === 'gameover' && (
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-black glow-text-magenta">KẾT THÚC CHƯƠNG TRÌNH</h2>
              <p className="text-xl">Trải qua 15 quý kinh doanh căng thẳng!</p>
              <div className="mt-8 p-6 bg-neutral-900 border border-yellow-500 rounded max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">👑 VUA THỊ TRƯỜNG 👑</h3>
                {leaderboard.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-black text-white">{leaderboard[0].name}</div>
                    <div className="text-xl text-green-400 font-mono">${leaderboard[0].funds?.toLocaleString()}</div>
                  </div>
                ) : (
                  <div>Không có ai sống sót</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="absolute bottom-6 right-6 z-50">
        <button 
          onClick={advancePhase}
          className="btn btn-lg bg-pink-600 hover:bg-pink-500 text-white border-none shadow-[0_0_15px_#ff007f] font-bold tracking-widest px-8"
        >
          {roomData.phase === 'setup' && 'BẮT ĐẦU GAME'}
          {roomData.phase === 'production' && 'CHUYỂN SANG ĐỊNH GIÁ ⏩'}
          {roomData.phase === 'sales' && 'CHỐT THỊ TRƯỜNG ⏩'}
          {roomData.phase === 'report' && 'QUÝ TIẾP THEO ⏩'}
          {roomData.phase === 'gameover' && 'XEM LẠI BẢNG XẾP HẠNG'}
        </button>
      </div>

    </div>
  );
}

export default MasterDashboard;
