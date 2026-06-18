import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, RefreshCw, AlertTriangle, Crown, Award, Landmark } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GameOverScreen() {
  const {
    teamName,
    funds,
    round,
    gameResultStatus,
    leaderboard,
    resetToSetup,
    aiCompetitors,
    upgraded,
    workers,
    history
  } = useGame();

  const won = gameResultStatus === 'win';
  const bankrupt = gameResultStatus === 'bankrupt';

  // Run confetti on victory
  useEffect(() => {
    if (won) {
      // Fire confetti burst
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00f0ff', '#ff007f', '#ffe600']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00f0ff', '#ff007f', '#ffe600']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [won]);

  // Calculate stats from history
  const totalSales = history.reduce((sum, r) => sum + (r.sales?.sales || 0), 0);
  const totalProduced = history.reduce((sum, r) => sum + (r.production?.produced || 0), 0);
  const totalRevenue = history.reduce((sum, r) => sum + (r.sales?.revenue || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      {/* Result Announcement */}
      <div className={`card cyber-panel p-8 text-center glow-border-${won ? 'cyan' : 'magenta'} shadow-2xl relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-2 left-2 text-xs text-cyan-800">SYSTEM_SHUTDOWN_LOG</div>
        <div className="absolute top-2 right-2 text-xs text-pink-800">CODE: {gameResultStatus?.toUpperCase()}</div>

        {won ? (
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-yellow-950/20 border border-yellow-500 rounded-full animate-bounce">
              <Crown className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-4xl font-extrabold text-yellow-400 tracking-wider glow-text-cyan">
              CHIẾN THẮNG: VUA THỊ TRƯỜNG!
            </h2>
            <p className="max-w-xl mx-auto text-gray-300 text-sm leading-relaxed">
              Xin chúc mừng <span className="text-cyan-400 font-bold">{teamName}</span>! Bạn đã lèo lái xưởng giày của mình xuất sắc qua 15 quý sản xuất sóng gió, tích lũy thành công số vốn khổng lồ <span className="text-emerald-400 font-bold">${funds.toLocaleString()}</span>.
            </p>
          </div>
        ) : bankrupt ? (
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-red-950/20 border border-red-500 rounded-full animate-pulse">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-4xl font-extrabold text-red-500 tracking-wider glow-text-magenta">
              HỒ SƠ PHÁ SẢN!
            </h2>
            <p className="max-w-xl mx-auto text-gray-300 text-sm leading-relaxed">
              Thị trường tàn nhẫn đã đè bẹp xưởng giày của <span className="text-pink-400 font-bold">{teamName}</span>. Bạn đã bị cạn kiệt nguồn vốn lưu động tại Quý {round} và buộc phải nộp đơn bảo hộ phá sản.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-pink-950/20 border border-pink-500 rounded-full">
              <Landmark className="w-12 h-12 text-pink-400" />
            </div>
            <h2 className="text-4xl font-extrabold text-pink-400 tracking-wider glow-text-magenta">
              THƯƠNG TRƯỜNG BẠI TRẬN
            </h2>
            <p className="max-w-xl mx-auto text-gray-300 text-sm leading-relaxed">
              Xưởng của <span className="text-pink-400 font-bold">{teamName}</span> sống sót được 15 quý, nhưng vốn tích lũy chỉ đạt <span className="text-pink-400 font-bold">${funds.toLocaleString()}</span>, chưa đạt mục tiêu tối thiểu <span className="text-emerald-400 font-bold">$100,000</span> để trở thành Vua Thị Trường.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Statistics */}
        <div className="card bg-neutral-900/60 border border-pink-900/40 p-5 space-y-4">
          <h3 className="text-pink-400 font-bold border-b border-pink-950 pb-2 flex items-center gap-2">
            <Award className="w-4 h-4" /> THỐNG KÊ HOẠT ĐỘNG
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-black/40 p-3 rounded border border-neutral-800">
              <span className="text-gray-500 block">Vốn Cuối Kỳ</span>
              <span className="text-lg font-bold text-emerald-400">${funds.toLocaleString()}</span>
            </div>
            <div className="bg-black/40 p-3 rounded border border-neutral-800">
              <span className="text-gray-500 block">Số Quý Trụ Lại</span>
              <span className="text-lg font-bold text-cyan-400">{round}/15 Quý</span>
            </div>
            <div className="bg-black/40 p-3 rounded border border-neutral-800">
              <span className="text-gray-500 block">Tổng Giày Sản Xuất</span>
              <span className="text-lg font-bold text-pink-400">{totalProduced.toLocaleString()} đôi</span>
            </div>
            <div className="bg-black/40 p-3 rounded border border-neutral-800">
              <span className="text-gray-500 block">Tổng Giày Đã Bán</span>
              <span className="text-lg font-bold text-white">{totalSales.toLocaleString()} đôi</span>
            </div>
            <div className="bg-black/40 p-3 rounded border border-neutral-800">
              <span className="text-gray-500 block">Tổng Doanh Thu</span>
              <span className="text-lg font-bold text-yellow-400">${totalRevenue.toLocaleString()}</span>
            </div>
            <div className="bg-black/40 p-3 rounded border border-neutral-800">
              <span className="text-gray-500 block">Hiệu Suất Máy Móc</span>
              <span className="text-lg font-bold text-white">
                {upgraded ? 'Đã Nâng Cấp (0.5h/đôi)' : 'Sơ Cấp (2h/đôi)'}
              </span>
            </div>
          </div>

          <div className="bg-cyan-950/20 p-3.5 rounded border border-cyan-900/40 text-xs text-gray-300 leading-relaxed">
            <span className="text-cyan-400 font-bold block mb-1">💡 BÀI HỌC KINH TẾ RÚT RA:</span>
            {won ? (
              'Bạn đã ứng dụng thành công Quy luật Giá trị để nâng cấp máy móc giúp hạ thời gian lao động cá biệt. Tích lũy tư bản thông qua cân đối cung - cầu, tận dụng biến cố lạm phát để tăng giá hợp lý và bán hàng nhanh chóng.'
            ) : bankrupt ? (
              'Thất bại thường do không nâng cấp máy móc khiến thời gian lao động cá biệt cao hơn xã hội (Quy luật Cạnh tranh), hoặc định giá bán quá cao so với trung bình thị trường gây khủng hoảng thừa hàng tồn kho, làm tắc nghẽn dòng vốn (Quy luật Cung - Cầu).'
            ) : (
              'Bạn đã sống sót, nhưng cấu tạo hữu cơ tư bản c/v chưa tối ưu hoặc quy mô sản xuất nhỏ chưa tạo ra đủ lượng giá trị thặng dư tích lũy. Muốn làm Vua Thị Trường, bạn phải đầu tư máy may tự động sớm hơn và mở rộng quy mô công nhân!'
            )}
          </div>
        </div>

        {/* Current Standings vs AI & Leaderboard */}
        <div className="card bg-neutral-900/60 border border-cyan-900/40 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-cyan-400 font-bold border-b border-cyan-950 pb-2 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> BẢNG XẾP HẠNG LỚP HỌC
            </h3>
            
            <div className="overflow-x-auto text-[11px] mb-4">
              <table className="table table-xs w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-gray-400">
                    <th>Hạng</th>
                    <th>Xưởng Đội</th>
                    <th className="text-right">Vốn</th>
                    <th className="text-right">Quý</th>
                    <th className="text-right">KQ</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 5).map((item, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-neutral-800/40 ${item.teamName === teamName ? 'text-cyan-300 font-bold bg-cyan-950/20' : ''}`}
                    >
                      <td>{idx + 1}</td>
                      <td className="max-w-[100px] truncate">{item.teamName}</td>
                      <td className="text-right text-emerald-400 font-bold">${item.finalFunds?.toLocaleString()}</td>
                      <td className="text-right">{item.round}</td>
                      <td className="text-right">
                        <span className={`badge badge-xs font-bold text-black ${item.won ? 'badge-success' : 'badge-error'}`}>
                          {item.won ? 'WIN' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={resetToSetup}
            className="btn btn-block bg-cyan-600 border-cyan-500 hover:bg-cyan-700 text-white font-mono font-bold uppercase tracking-wider"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> CHƠI LẠI VÒNG MỚI
          </button>
        </div>
      </div>
    </div>
  );
}
