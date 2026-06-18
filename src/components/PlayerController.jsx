import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { database } from '../firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { playSound } from '../context/GameContext'; // reuse sound if we want, or just skip

function PlayerController() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const playerName = searchParams.get('name') || 'Vô Danh';
  
  const [roomData, setRoomData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  
  // Local Player States for Production
  const [workers, setWorkers] = useState(1);
  const [materials, setMaterials] = useState(0);
  const [upgraded, setUpgraded] = useState(false);
  
  // Sales
  const [salesPrice, setSalesPrice] = useState(35);
  
  // Game constants
  const workerWage = 500;
  const materialPrice = 10; // Simple fixed price for now, could sync from room event
  const upgradeCost = 3000;

  // UUID for player
  const [playerId] = useState(() => {
    let id = localStorage.getItem('mk_player_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('mk_player_id', id);
    }
    return id;
  });

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoomData(data);
        if (data.players && data.players[playerId]) {
          setPlayerData(data.players[playerId]);
          
          // Sync local state with remote when transitioning to production
          if (data.phase === 'production' && !data.players[playerId].productionReady) {
            // We could reset workers/materials here if needed
          }
        } else if (data.phase === 'setup') {
          // Join room if in setup
          const pRef = ref(database, `rooms/${roomId}/players/${playerId}`);
          get(pRef).then(snap => {
            if (!snap.exists()) {
              update(ref(database), {
                [`rooms/${roomId}/players/${playerId}`]: {
                  name: playerName,
                  funds: 10000,
                  shoesInStock: 0,
                  productionReady: false,
                  salesReady: false
                }
              });
            }
          });
        }
      }
    });
    
    return () => unsubscribe();
  }, [roomId, playerId, playerName]);

  if (!roomData) {
    return <div className="p-4 text-center">Đang kết nối vào phòng...</div>;
  }

  if (!playerData && roomData.phase !== 'setup') {
    return <div className="p-4 text-center text-red-500">Game đã bắt đầu, bạn không thể tham gia giữa chừng.</div>;
  }

  // --- Production Actions ---
  const hireWorker = () => setWorkers(prev => prev + 1);
  const fireWorker = () => setWorkers(prev => Math.max(1, prev - 1));
  const buyMaterials = (amount) => {
    const cost = amount * materialPrice;
    if (playerData.funds - cost >= workers * workerWage) {
      setMaterials(prev => prev + amount);
      update(ref(database), {
        [`rooms/${roomId}/players/${playerId}/funds`]: playerData.funds - cost
      });
    } else {
      alert("Không đủ tiền (cần giữ lại tiền trả lương)!");
    }
  };
  const upgradeMachine = () => {
    if (!upgraded && playerData.funds - upgradeCost >= workers * workerWage) {
      setUpgraded(true);
      update(ref(database), {
        [`rooms/${roomId}/players/${playerId}/funds`]: playerData.funds - upgradeCost
      });
    }
  };

  const submitProduction = () => {
    const laborTime = upgraded ? 0.5 : 2.0;
    const capacityPerWorker = Math.floor(480 / laborTime);
    const maxCapacity = workers * capacityPerWorker;
    
    const produced = Math.min(materials, maxCapacity);
    const totalWages = workers * workerWage;
    const newFunds = playerData.funds - totalWages;
    
    setMaterials(materials - produced);
    
    update(ref(database), {
      [`rooms/${roomId}/players/${playerId}/shoesProduced`]: produced,
      [`rooms/${roomId}/players/${playerId}/funds`]: newFunds,
      [`rooms/${roomId}/players/${playerId}/productionReady`]: true
    });
  };

  const submitSales = () => {
    update(ref(database), {
      [`rooms/${roomId}/players/${playerId}/price`]: salesPrice,
      [`rooms/${roomId}/players/${playerId}/salesReady`]: true
    });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4 font-sans scanline-bg">
      <header className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-4">
        <div>
          <h2 className="font-bold text-cyan-400">{playerName}</h2>
          <div className="text-xs text-neutral-500">Room: {roomId}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-400">Tiền mặt</div>
          <div className="text-xl font-mono text-green-400">${playerData?.funds?.toLocaleString() || 10000}</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {roomData.phase === 'setup' && (
          <div className="text-center mt-20 space-y-4">
            <h1 className="text-2xl text-pink-500 animate-pulse">Đã vào phòng</h1>
            <p className="text-neutral-400">Đợi máy chủ bắt đầu game...</p>
          </div>
        )}

        {roomData.phase === 'production' && !playerData?.productionReady && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyan-400 text-center">SẢN XUẤT</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-neutral-900 p-4 border border-neutral-800 text-center">
                 <div className="text-xs text-neutral-400 mb-2">Công nhân (${workerWage})</div>
                 <div className="text-3xl mb-2">{workers}</div>
                 <div className="flex justify-center space-x-2">
                   <button className="btn btn-sm btn-circle" onClick={fireWorker}>-</button>
                   <button className="btn btn-sm btn-circle" onClick={hireWorker}>+</button>
                 </div>
              </div>
              
              <div className="card bg-neutral-900 p-4 border border-neutral-800 text-center">
                 <div className="text-xs text-neutral-400 mb-2">Nguyên liệu (${materialPrice})</div>
                 <div className="text-3xl mb-2">{materials}</div>
                 <div className="flex justify-center space-x-2">
                   <button className="btn btn-sm btn-outline text-xs" onClick={() => buyMaterials(10)}>+10</button>
                   <button className="btn btn-sm btn-outline text-xs" onClick={() => buyMaterials(100)}>+100</button>
                 </div>
              </div>
            </div>

            <div className="card bg-neutral-900 p-4 border border-neutral-800 flex justify-between items-center">
              <div>
                <div className="text-sm">Công nghệ may</div>
                <div className="text-xs text-neutral-500">{upgraded ? 'Tự động hoá (0.5h/giày)' : 'Thủ công (2h/giày)'}</div>
              </div>
              <button 
                className={`btn btn-sm ${upgraded ? 'btn-success' : 'btn-outline border-cyan-500 text-cyan-500'}`}
                onClick={upgradeMachine}
                disabled={upgraded}
              >
                {upgraded ? 'Đã Nâng' : `$${upgradeCost}`}
              </button>
            </div>

            <button 
              className="btn btn-lg w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              onClick={submitProduction}
            >
              CHỐT SẢN XUẤT
            </button>
          </div>
        )}

        {roomData.phase === 'production' && playerData?.productionReady && (
          <div className="text-center mt-20 text-neutral-400 space-y-4">
            <div className="text-4xl">⏳</div>
            <p>Đã nộp bài. Chờ các xưởng khác...</p>
          </div>
        )}

        {roomData.phase === 'sales' && !playerData?.salesReady && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-yellow-400 text-center">ĐỊNH GIÁ</h3>
            <div className="card bg-neutral-900 p-6 border border-yellow-500/50 text-center space-y-6">
              <div>
                 <div className="text-sm text-neutral-400">Số giày đang có (Kho + Mới SX)</div>
                 <div className="text-4xl text-cyan-400 font-mono">{(playerData?.shoesProduced || 0) + (playerData?.shoesInStock || 0)}</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Đặt giá bán ($/đôi)</label>
                <div className="flex items-center justify-center space-x-4">
                  <button className="btn btn-circle btn-outline" onClick={() => setSalesPrice(p => Math.max(1, p - 1))}>-</button>
                  <span className="text-3xl w-20">${salesPrice}</span>
                  <button className="btn btn-circle btn-outline" onClick={() => setSalesPrice(p => p + 1)}>+</button>
                </div>
              </div>

              <button 
                className="btn btn-lg w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                onClick={submitSales}
              >
                BÁN HÀNG
              </button>
            </div>
          </div>
        )}

        {roomData.phase === 'sales' && playerData?.salesReady && (
          <div className="text-center mt-20 text-neutral-400 space-y-4">
            <div className="text-4xl">⏳</div>
            <p>Đã đặt giá ${playerData.price}. Chờ công bố thị trường...</p>
          </div>
        )}

        {roomData.phase === 'report' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-green-400 text-center">KẾT QUẢ BÁN HÀNG</h3>
            
            <div className="card bg-neutral-900 p-4 border border-neutral-800 space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-400">Bạn đã đặt giá:</span>
                <span className="font-bold text-yellow-400">${playerData?.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Giá TB thị trường:</span>
                <span className="font-bold text-cyan-400">${roomData.market?.averagePrice?.toFixed(1)}</span>
              </div>
              
              <div className="divider my-1"></div>
              
              <div className="flex justify-between text-lg">
                <span>Số lượng bán được:</span>
                <span className="font-bold text-green-400">{playerData?.lastResult?.sold || 0} đôi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Tồn kho bị ế:</span>
                <span className="text-red-400">{playerData?.lastResult?.unsold || 0} đôi</span>
              </div>
              
              <div className="divider my-1"></div>
              
              <div className="flex justify-between text-xl font-bold">
                <span>Lợi nhuận ròng:</span>
                <span className={playerData?.lastResult?.profit >= 0 ? "text-green-500" : "text-red-500"}>
                  ${playerData?.lastResult?.profit?.toLocaleString()}
                </span>
              </div>
            </div>
            
            <p className="text-center text-neutral-500 text-xs">Hãy xem bảng xếp hạng trên máy chiếu!</p>
          </div>
        )}

        {roomData.phase === 'gameover' && (
          <div className="text-center mt-20 space-y-6">
            <h2 className="text-3xl font-bold text-pink-500">KẾT THÚC</h2>
            <p className="text-neutral-400">Cảm ơn bạn đã tham gia.</p>
            <div className="text-2xl">Tiền của bạn: <span className="text-green-400">${playerData?.funds?.toLocaleString()}</span></div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PlayerController;
