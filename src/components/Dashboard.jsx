import React, { useState } from 'react';
import { useGame, playSound } from '../context/GameContext';
import { Volume2, VolumeX, RotateCcw, HelpCircle, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import ProductionPhase from './ProductionPhase';
import SalesPhase from './SalesPhase';
import QuarterReport from './QuarterReport';

export default function Dashboard() {
  const {
    teamName,
    round,
    phase,
    funds,
    event,
    timeLeft,
    timerEnabled,
    soundOn,
    setSoundOn,
    resetToSetup
  } = useGame();

  const [showGlossary, setShowGlossary] = useState(false);

  // Time progress bar color calculation
  const timerPercentage = (timeLeft / 30) * 100;
  let timerColorClass = 'progress-primary';
  if (timeLeft <= 15 && timeLeft > 7) {
    timerColorClass = 'progress-warning';
  } else if (timeLeft <= 7) {
    timerColorClass = 'progress-error';
  }

  // Toggle sound state
  const handleToggleSound = () => {
    const nextSoundState = !soundOn;
    setSoundOn(nextSoundState);
    if (nextSoundState) {
      playSound('cash', true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-mono relative">
      {/* Help Glossary Modal */}
      {showGlossary && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-xl p-6 bg-neutral-950 border border-cyan-500 glow-border-cyan space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-cyan-900 pb-2">
              <h3 className="font-extrabold text-cyan-400 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> TÀI LIỆU KINH TẾ CHÍNH TRỊ
              </h3>
              <button
                onClick={() => setShowGlossary(false)}
                className="btn btn-sm btn-circle btn-outline border-cyan-900 text-cyan-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs overflow-y-auto max-h-[350px] pr-2">
              <div>
                <h4 className="font-bold text-pink-400 uppercase">1. Quy luật Giá trị & Hao phí lao động</h4>
                <p className="text-gray-400 mt-1 leading-relaxed">
                  Giá trị hàng hóa do thời gian lao động xã hội cần thiết quyết định. Trong game, nâng cấp máy may tự động giúp giảm thời gian lao động cá biệt của bạn dưới mức xã hội (từ 2 giờ xuống 0.5 giờ). Nhờ đó, bạn thu về giá trị thặng dư siêu ngạch khi bán ngang giá thị trường.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-pink-400 uppercase">2. Cấu tạo hữu cơ của Tư bản (c/v)</h4>
                <p className="text-gray-400 mt-1 leading-relaxed">
                  Là cấu tạo giá trị của tư bản, do cấu tạo kỹ thuật quyết định và phản ánh sự biến đổi của cấu tạo kỹ thuật đó. 
                  Ký hiệu: <span className="text-white font-bold">c/v</span> (trong đó <span className="text-cyan-400">c</span> là tư bản bất biến - máy móc, nguyên liệu; <span className="text-pink-400">v</span> là tư bản khả biến - tiền lương công nhân). Cải tiến kỹ thuật làm tăng c/v để nâng năng suất, đè bẹp đối thủ thủ công.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-pink-400 uppercase">3. Quy luật Cung - Cầu</h4>
                <p className="text-gray-400 mt-1 leading-relaxed">
                  Cung và cầu tác động trực tiếp lên giá cả thị trường. Khi cung lớn hơn cầu, hàng hóa ế ẩm gây khủng hoảng thừa (bạn mất chi phí lưu kho $1/đôi giày). Khi cầu lớn hơn cung (Boom tiêu dùng), bạn có thể thoải mái tăng giá bán kiếm lời lớn.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-pink-400 uppercase">4. Quy luật Lưu thông Tiền tệ</h4>
                <p className="text-gray-400 mt-1 leading-relaxed">
                  Lượng tiền cần thiết cho lưu thông được xác định bằng tổng giá trị hàng hóa chia cho số vòng quay của đồng tiền. Khi in quá nhiều tiền cứu trợ, đồng tiền mất giá gây ra lạm phát lớn làm giá nguyên liệu đầu vào tăng vọt 200%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main HUD Header */}
      <div className="card bg-neutral-900/80 border border-cyan-800/40 p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left section: Team info & round details */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between sm:justify-start">
          <div>
            <h2 className="text-white font-bold text-sm truncate max-w-[150px]">{teamName}</h2>
            <div className="badge badge-outline border-cyan-800 text-cyan-400 font-mono text-[10px] uppercase mt-1">
              Quý {round}/15 (Quý {Math.floor((round - 1) / 4) + 1} Năm {((round - 1) % 4) + 1})
            </div>
          </div>
          <div className="divider divider-horizontal border-cyan-950/20 hidden sm:flex"></div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase block">Trạng Thái Lượt</span>
            <span className="text-xs font-bold text-pink-400 uppercase">
              {phase === 'production' && '⚒️ Sản Xuất (Chuẩn Bị)'}
              {phase === 'sales' && '🛍️ Lưu Thông (Bán Hàng)'}
              {phase === 'report' && '📊 Đối Chiếu (Báo Cáo)'}
            </span>
          </div>
        </div>

        {/* Center: Funds visualization */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 uppercase">Tổng Tư Bản Tích Lũy</span>
          <span className="text-3xl font-extrabold text-emerald-400 glow-text-green tracking-wide">
            ${funds?.toLocaleString()}
          </span>
        </div>

        {/* Right: Controls & Event indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between sm:justify-end">
          {/* Micro-event display */}
          <div className={`badge badge-${event.color || 'success'} font-bold py-3 text-[10px] uppercase flex items-center gap-1`}>
            <AlertCircle className="w-3.5 h-3.5" />
            {event.name}
          </div>

          <div className="flex gap-2">
            {/* Economic Glossary Helper */}
            <button
              onClick={() => setShowGlossary(true)}
              className="btn btn-sm btn-outline border-cyan-800 text-cyan-400"
              title="Xem giải nghĩa quy luật kinh tế"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`btn btn-sm btn-outline border-cyan-800 ${soundOn ? 'text-pink-400' : 'text-gray-500'}`}
              title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Force restart */}
            <button
              onClick={resetToSetup}
              className="btn btn-sm btn-outline btn-error"
              title="Bỏ cuộc & chơi lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Countdown Timer HUD (Production & Sales phases only) */}
      {timerEnabled && (phase === 'production' || phase === 'sales') && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-gray-500">KHOẢNG THỜI GIAN CHU CHUYỂN CÒN LẠI:</span>
            <span className={`font-bold ${timeLeft <= 8 ? 'text-error animate-pulse' : 'text-cyan-400'}`}>
              {timeLeft} giây
            </span>
          </div>
          <progress
            className={`progress ${timerColorClass} w-full h-2 rounded transition-all duration-300`}
            value={timeLeft}
            max="30"
          ></progress>
        </div>
      )}

      {/* Game Stage Router */}
      <div className="card bg-neutral-900/40 border border-cyan-950 p-6 min-h-[400px]">
        {phase === 'production' && <ProductionPhase />}
        {phase === 'sales' && <SalesPhase />}
        {phase === 'report' && <QuarterReport />}
      </div>
    </div>
  );
}
