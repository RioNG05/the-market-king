import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Play, Clock, Sparkles, HelpCircle, DollarSign, Users, ShieldAlert, Cpu } from 'lucide-react';

export default function SetupScreen() {
  const { startGame, leaderboard, clearLeaderboard } = useGame();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [useTimer, setUseTimer] = useState(true);
  const [activeTab, setActiveTab] = useState('rules'); // rules, leaderboard

  const handleSubmit = (e) => {
    e.preventDefault();
    startGame(name, difficulty, useTimer);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto items-stretch">
      {/* Game Setup Panel */}
      <div className="card w-full lg:w-1/2 cyber-panel glow-border-cyan shadow-xl p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold tracking-wider text-cyan-400 font-mono glow-text-cyan flex items-center justify-center gap-2">
              👑 THE MARKET KING
            </h1>
            <p className="text-xs uppercase tracking-widest text-pink-400 font-mono mt-1 glow-text-magenta">
              Vua Thị Trường v1.0.0
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Team/Player Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-cyan-300 font-mono text-sm">Tên Xưởng Sản Xuất / Đội Chơi</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên xưởng..."
                className="input input-bordered border-cyan-500 bg-black text-cyan-100 placeholder-cyan-700 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                required
              />
            </div>

            {/* Difficulty Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-cyan-300 font-mono text-sm">Độ Khó (Vốn Ban Đầu)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDifficulty('easy')}
                  className={`btn btn-sm font-mono ${difficulty === 'easy' ? 'btn-success text-black border-success' : 'btn-outline border-cyan-800 text-cyan-600 hover:bg-cyan-900/30'}`}
                >
                  DỄ ($12,000)
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('medium')}
                  className={`btn btn-sm font-mono ${difficulty === 'medium' ? 'btn-primary text-black border-primary' : 'btn-outline border-cyan-800 text-cyan-600 hover:bg-cyan-900/30'}`}
                >
                  TRUNG BÌNH ($10,000)
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('hard')}
                  className={`btn btn-sm font-mono ${difficulty === 'hard' ? 'btn-error text-black border-error' : 'btn-outline border-cyan-800 text-cyan-600 hover:bg-cyan-900/30'}`}
                >
                  KHÓ ($8,000)
                </button>
              </div>
              <label className="label mt-1">
                <span className="label-text-alt text-gray-500 font-mono">
                  {difficulty === 'easy' && 'Phù hợp để làm quen: Vốn dày, dễ xoay xở khi lạm phát.'}
                  {difficulty === 'medium' && 'Mức chuẩn: Đòi hỏi tính toán dòng tiền cẩn thận.'}
                  {difficulty === 'hard' && 'Cực hạn tư bản: Vốn ban đầu ít, nguy cơ phá sản cao!'}
                </span>
              </label>
            </div>

            {/* Timer Toggle */}
            <div className="form-control bg-cyan-950/20 p-3 rounded-lg border border-cyan-900/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-400" />
                <div>
                  <span className="text-sm font-mono font-bold text-white block">Áp Dụng Giới Hạn Thời Gian</span>
                  <span className="text-xs text-gray-400 font-mono">30 giây cho mỗi giai đoạn sản xuất và bán hàng.</span>
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-block btn-lg bg-pink-600 border-pink-500 hover:bg-pink-700 text-white font-bold font-mono tracking-widest mt-6 animate-pulse-fast hover:animate-none shadow-lg shadow-pink-500/20"
            >
              <Play className="w-5 h-5 fill-current" /> BẮT ĐẦU CHU CHUYỂN
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-cyan-800 font-mono mt-6 pt-4 border-t border-cyan-950">
          DESIGNED FOR SCHOOL TYCOON COMPETITIONS
        </div>
      </div>

      {/* Rules & Leaderboard Screen */}
      <div className="card w-full lg:w-1/2 bg-neutral-900/50 border border-pink-900/40 p-6 flex flex-col">
        {/* Tab Controls */}
        <div className="flex border-b border-pink-900/40 mb-4">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-4 font-mono font-bold text-sm border-b-2 transition-all ${activeTab === 'rules' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            📋 QUY LUẬT CHƠI
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-2 px-4 font-mono font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <Trophy className="w-4 h-4" /> BẢNG XẾP HẠNG
          </button>
        </div>

        {/* Tab Content: Rules */}
        {activeTab === 'rules' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm font-mono">
            <h3 className="text-pink-400 font-bold border-b border-pink-950 pb-1">MỤC TIÊU CỦA BẠN</h3>
            <p className="text-gray-300 leading-relaxed">
              Bạn đóng vai chủ một xưởng sản xuất giày. Hãy quản lý dòng vốn của bạn để <span className="text-emerald-400 font-bold">sống sót qua 15 quý (15 lượt chơi)</span> và tích lũy được tối thiểu <span className="text-emerald-400 font-bold">$100,000 vốn hóa</span>.
            </p>

            <h3 className="text-pink-400 font-bold border-b border-pink-950 pb-1 mt-4">4 QUY LUẬT KINH TẾ QUYẾT ĐỊNH</h3>
            <div className="space-y-3">
              {/* Law 1 */}
              <div className="group bg-cyan-950/10 p-2.5 rounded border border-cyan-950/30 hover:border-cyan-700/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-cyan-400 mb-0.5">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span>1. Quy luật Giá trị</span>
                </div>
                <p className="text-xs text-gray-400">
                  Giá trị hàng hóa được đo bằng thời gian lao động xã hội cần thiết. Nếu bạn nâng cấp máy móc tự động, thời gian lao động cá biệt của bạn sẽ giảm sâu (2 giờ xuống 0.5 giờ), giúp hạ giá trị cá biệt để thu lợi nhuận siêu ngạch.
                </p>
              </div>

              {/* Law 2 */}
              <div className="group bg-cyan-950/10 p-2.5 rounded border border-cyan-950/30 hover:border-cyan-700/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-cyan-400 mb-0.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>2. Quy luật Cạnh tranh</span>
                </div>
                <p className="text-xs text-gray-400">
                  Cạnh tranh thúc đẩy cải tiến công nghệ. Đầu tư vào máy móc làm tăng Cấu tạo hữu cơ tư bản (<span className="text-pink-400 font-bold">c/v</span>). Nếu không cải tiến, giá thành của bạn sẽ cao hơn 3 đối thủ AI và bị đẩy ra khỏi thị trường.
                </p>
              </div>

              {/* Law 3 */}
              <div className="group bg-cyan-950/10 p-2.5 rounded border border-cyan-950/30 hover:border-cyan-700/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-cyan-400 mb-0.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>3. Quy luật Cung - Cầu</span>
                </div>
                <p className="text-xs text-gray-400">
                  Cung vượt Cầu dẫn đến hàng tồn kho (khủng hoảng thừa). Cầu vượt Cung giúp tăng giá bán. Giá bán giày của bạn phải cực kỳ linh hoạt so với các xưởng đối thủ để thu hút khách hàng.
                </p>
              </div>

              {/* Law 4 */}
              <div className="group bg-cyan-950/10 p-2.5 rounded border border-cyan-950/30 hover:border-cyan-700/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-cyan-400 mb-0.5">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span>4. Quy luật Lưu thông tiền tệ</span>
                </div>
                <p className="text-xs text-gray-400">
                  Các biến cố vĩ mô ngẫu nhiên xuất hiện ở mỗi cuối quý: Ngân hàng in quá nhiều tiền sẽ gây lạm phát làm tăng giá nguyên liệu đầu vào, hoặc Đại dịch gây đứt gãy làm sức mua sập 80%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 flex flex-col justify-between font-mono">
            <div className="overflow-x-auto">
              <table className="table table-xs w-full text-left">
                <thead>
                  <tr className="border-b border-pink-900/30 text-pink-400 text-xs">
                    <th>Hạng</th>
                    <th>Tên Đội</th>
                    <th className="text-center">Độ Khó</th>
                    <th className="text-center">Q.Quý</th>
                    <th className="text-right">Vốn Cuối</th>
                    <th className="text-right">Kết Quả</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-600">
                        Chưa có dữ liệu bảng xếp hạng. Hãy chơi lượt đầu tiên!
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-neutral-800 hover:bg-neutral-800/40 ${idx === 0 ? 'text-yellow-400 font-bold bg-yellow-950/10' : ''}`}
                      >
                        <td className="font-bold">{idx + 1}</td>
                        <td className="max-w-[120px] truncate">{item.teamName}</td>
                        <td className="text-center uppercase text-[10px]">
                          {item.difficulty === 'easy' && <span className="text-success">Dễ</span>}
                          {item.difficulty === 'medium' && <span className="text-primary">Vừa</span>}
                          {item.difficulty === 'hard' && <span className="text-error">Khó</span>}
                        </td>
                        <td className="text-center">{item.round}/15</td>
                        <td className="text-right font-bold text-emerald-400">${item.finalFunds?.toLocaleString()}</td>
                        <td className="text-right">
                          {item.won ? (
                            <span className="badge badge-success badge-xs font-bold text-black py-1 px-1.5">THẮNG</span>
                          ) : (
                            <span className="badge badge-error badge-xs font-bold text-black py-1 px-1.5">THUA</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {leaderboard.length > 0 && (
              <div className="mt-4 pt-4 border-t border-pink-950/40 text-right">
                <button
                  type="button"
                  onClick={clearLeaderboard}
                  className="btn btn-xs btn-outline btn-error font-mono text-[10px]"
                >
                  Xóa Lịch Sử Đua Top
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
