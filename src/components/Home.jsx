import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim() && playerName.trim()) {
      navigate(`/play/${roomId.trim()}?name=${encodeURIComponent(playerName.trim())}`);
    }
  };

  const createRoom = () => {
    // Generate a random 4-digit or 6-character room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/master/${newRoomId}`);
  };

  const handleHiddenClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 >= 5) {
      navigate('/solo');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full px-4">
      <div className="text-center space-y-2">
        <h1 
          className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 glow-text-cyan select-none cursor-default"
          onClick={handleHiddenClick}
        >
          THE MARKET KING
        </h1>
        <p className="text-neutral-400 font-mono text-sm">Classroom Edition</p>
      </div>

      <div className="card bg-neutral-900 border border-neutral-800 p-6 w-full shadow-xl space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-cyan-400">Tham gia bằng Mã Phòng</h2>
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="label text-xs text-neutral-400">Tên Xưởng / Tên bạn</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Xưởng Tuấn Hưng" 
                className="input input-bordered w-full bg-black border-neutral-700 text-white focus:border-cyan-500"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="label text-xs text-neutral-400">Mã Phòng</label>
              <input 
                type="text" 
                placeholder="Nhập mã 6 ký tự" 
                className="input input-bordered w-full bg-black border-neutral-700 text-white font-mono uppercase focus:border-cyan-500"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="btn w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none hover:opacity-90">
              VÀO PHÒNG
            </button>
          </form>
        </div>

        <div className="divider text-neutral-600 text-xs">HOẶC</div>

        <div>
          <button 
            onClick={createRoom}
            className="btn btn-outline border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white w-full"
          >
            Tạo Phòng Mới (Dành cho Giảng viên/Master)
          </button>
        </div>
      </div>
      
      {clickCount > 0 && clickCount < 5 && (
        <div className="text-xs text-neutral-600">Click {5 - clickCount} times to unlock Solo mode</div>
      )}
    </div>
  );
}

export default Home;
