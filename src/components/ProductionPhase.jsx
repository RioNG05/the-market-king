import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Users, Package, Cpu, HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ProductionPhase() {
  const {
    funds,
    materials,
    workers,
    upgraded,
    materialPrice,
    workerWage,
    buyMaterials,
    sellMaterialsBack,
    hireWorker,
    fireWorker,
    upgradeSewingMachine,
    submitProduction
  } = useGame();

  const [buyQty, setBuyQty] = useState(10);

  // Constants
  const laborTime = upgraded ? 0.5 : 2.0;
  const capacityPerWorker = Math.floor(480 / laborTime);
  const totalCapacity = workers * capacityPerWorker;
  const wagesCost = workers * workerWage;

  // Live production projection
  const shoesToProduce = Math.min(materials, totalCapacity);
  const c_materials = shoesToProduce * materialPrice;
  const v_wages = wagesCost;
  const c_machine = upgraded ? 3000 / 15 : 0; // amortized upgrade cost
  const totalC = c_materials + c_machine;
  const organicComposition = v_wages > 0 ? (totalC / v_wages).toFixed(2) : '0.00';

  // Socially Necessary Labor Time (Average of competitors + Player, approx 1.5 - 2.0 hours)
  const socialNecessaryTime = 1.75; 

  // Handlers
  const handleBuy = (qty) => {
    buyMaterials(qty);
  };

  const handleSellBack = () => {
    if (materials >= 10) {
      sellMaterialsBack(10);
    }
  };

  // Max materials that can be bought reserving worker wages
  const maxBuyable = Math.floor(Math.max(0, funds - wagesCost) / materialPrice);

  return (
    <div className="space-y-6 font-mono text-left">
      {/* Top Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Funds Info */}
        <div className="bg-neutral-900/80 border border-cyan-800/40 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-xs text-gray-500 uppercase">Ngân Sách Khả Dụng</span>
          <span className="text-2xl font-bold text-emerald-400 glow-text-cyan">${funds.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 mt-1">
            Đã trừ sẵn lương dự phòng: <span className="text-pink-400">${wagesCost.toLocaleString()}</span>
          </span>
        </div>

        {/* Materials in stock */}
        <div className="bg-neutral-900/80 border border-cyan-800/40 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-xs text-gray-500 uppercase">Kho Nguyên Liệu (Da, Đế)</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-cyan-400">{materials} bộ</span>
            <span className="text-xs text-gray-400">Giá mua: <span className="text-yellow-400 font-bold">${materialPrice}/bộ</span></span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">1 bộ nguyên liệu làm được 1 đôi giày</span>
        </div>

        {/* Target Production Capacity */}
        <div className="bg-neutral-900/80 border border-cyan-800/40 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-xs text-gray-500 uppercase">Hạn Mức Công Suất Quý</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-pink-400">{totalCapacity} đôi</span>
            <span className="text-xs text-gray-400">{workers} công nhân x {capacityPerWorker} đôi</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">Thời gian làm việc: 480 giờ/công nhân/quý</span>
        </div>
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action 1: Hire Workers */}
          <div className="card bg-neutral-900/40 border border-cyan-900/30 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-cyan-950 pb-2">
              <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> 1. QUẢN LÝ CÔNG NHÂN (Tư Bản Khả Biến - v)
              </h3>
              <div className="tooltip tooltip-left" data-tip="Tiền thuê công nhân gọi là Tư bản khả biến (v) vì nó tạo ra giá trị mới lớn hơn giá trị bản thân nó (Giá trị thặng dư).">
                <HelpCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-300">
                  Lương công nhân: <span className="text-pink-400 font-bold">${workerWage}/quý</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Đang thuê: <span className="text-white font-bold">{workers} công nhân</span> (Chi phí: <span className="text-pink-400 font-bold">${wagesCost}</span>)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fireWorker}
                  disabled={workers <= 1}
                  className="btn btn-outline border-cyan-800 text-cyan-500 btn-sm font-mono w-12"
                >
                  -
                </button>
                <span className="font-bold text-md px-4 text-white">{workers}</span>
                <button
                  onClick={hireWorker}
                  className="btn btn-outline border-cyan-800 text-cyan-500 btn-sm font-mono w-12"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action 2: Buy Materials */}
          <div className="card bg-neutral-900/40 border border-cyan-900/30 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-cyan-950 pb-2">
              <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                <Package className="w-4 h-4" /> 2. MUA NGUYÊN LIỆU (Tư Bản Bất Biến - c)
              </h3>
              <div className="tooltip tooltip-left" data-tip="Nguyên liệu da và đế giày là một bộ phận của Tư bản bất biến (c). Giá trị của nó chỉ được dịch chuyển nguyên vẹn vào đôi giày trong quá trình sản xuất.">
                <HelpCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-gray-300 block">Số lượng mua hiện tại:</span>
                  <span className="text-xs text-gray-500">
                    Chi phí mua dự kiến: <span className="text-yellow-400 font-bold">${(buyQty * materialPrice).toLocaleString()}</span>
                  </span>
                </div>
                <div className="join">
                  <button onClick={() => setBuyQty(10)} className={`btn btn-xs join-item font-mono ${buyQty === 10 ? 'btn-primary text-black' : ''}`}>10</button>
                  <button onClick={() => setBuyQty(50)} className={`btn btn-xs join-item font-mono ${buyQty === 50 ? 'btn-primary text-black' : ''}`}>50</button>
                  <button onClick={() => setBuyQty(100)} className={`btn btn-xs join-item font-mono ${buyQty === 100 ? 'btn-primary text-black' : ''}`}>100</button>
                  <button onClick={() => setBuyQty(maxBuyable)} className={`btn btn-xs join-item font-mono ${buyQty === maxBuyable ? 'btn-primary text-black' : ''}`}>MAX ({maxBuyable})</button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleBuy(buyQty)}
                  disabled={buyQty <= 0 || buyQty > maxBuyable}
                  className="btn btn-sm bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
                >
                  Mua +{buyQty} Bộ Da & Đế
                </button>
                
                {materials >= 10 && (
                  <button
                    onClick={handleSellBack}
                    className="btn btn-sm btn-outline btn-error font-mono"
                    title="Bán trả lại 10 bộ nguyên liệu chịu phạt 20% giá để thu hồi tiền mặt khẩn cấp trả lương."
                  >
                    Thanh Lý 10 Bộ (Thu hồi: ${Math.floor(10 * materialPrice * 0.8)})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action 3: Upgrade Technology */}
          <div className="card bg-neutral-900/40 border border-cyan-900/30 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-cyan-950 pb-2">
              <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> 3. NÂNG CẤP MÁY MAY TỰ ĐỘNG (Cải Tiến Kỹ Thuật)
              </h3>
              <div className="tooltip tooltip-left" data-tip="Máy móc tự động tăng năng suất lao động cá biệt. Tỷ trọng mua máy móc tăng so với thuê nhân công làm tăng Cấu tạo hữu cơ tư bản (c/v).">
                <HelpCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-300">
                  Phí lắp đặt máy may công nghiệp: <span className="text-emerald-400 font-bold">$3,000</span> (trả một lần)
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Hiệu quả: Giảm thời gian lao động làm ra 1 đôi giày từ <span className="text-pink-400 font-bold">2.0 giờ</span> xuống <span className="text-emerald-400 font-bold">0.5 giờ</span>. Tăng mạnh năng suất làm giày của mỗi công nhân gấp 4 lần!
                </p>
              </div>

              {upgraded ? (
                <span className="badge badge-success font-mono font-bold text-black py-2 px-3">ĐÃ KÍCH HOẠT</span>
              ) : (
                <button
                  type="button"
                  onClick={upgradeSewingMachine}
                  disabled={funds - 3000 < wagesCost}
                  className="btn btn-sm btn-secondary font-mono glow-border-magenta"
                >
                  Nâng Cấp $3,000
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Dashboard Stats / Projections */}
        <div className="space-y-6">
          {/* Cyber Dashboard Analytics */}
          <div className="card bg-neutral-900/80 border border-pink-900/40 p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-widest text-pink-400 border-b border-pink-950 pb-2">
              📊 TELEMETRY ĐO LƯỜNG TƯ BẢN
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Productive time comparing */}
              <div className="bg-black/50 p-3 rounded border border-neutral-800">
                <span className="text-gray-500 block">Thời Gian Lao Động Cá Biệt</span>
                <div className="flex justify-between items-center font-bold text-white mt-1">
                  <span>{laborTime} giờ/đôi</span>
                  <span className="text-[10px] text-gray-400">Thời gian Xã hội: {socialNecessaryTime}h</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-2 overflow-hidden flex">
                  <div
                    className={`h-full ${laborTime < socialNecessaryTime ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${(laborTime / 3.0) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {laborTime < socialNecessaryTime ? (
                    <span className="text-emerald-400">Tốt! Hiệu suất cao hơn trung bình xã hội.</span>
                  ) : (
                    <span className="text-red-400">Cảnh báo: Năng suất thấp! Bạn dễ thua lỗ.</span>
                  )}
                </span>
              </div>

              {/* Organic composition of capital */}
              <div className="bg-black/50 p-3 rounded border border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Cấu Tạo Hữu Cơ Tư Bản (c/v)</span>
                  <div className="tooltip tooltip-top" data-tip="Tỷ lệ c/v biểu thị tỷ trọng đầu tư vào tư bản bất biến (da + máy móc) so với tư bản khả biến (lương công nhân). Tỷ lệ này càng cao chứng tỏ xưởng của bạn có mức tự động hóa cao.">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-600 cursor-pointer" />
                  </div>
                </div>
                <span className="text-xl font-bold text-cyan-400 block mt-1">{organicComposition}</span>
                <span className="text-[9px] text-gray-500 leading-normal block mt-1">
                  Cấu tạo kỹ thuật tăng (nhiều máy móc hơn lao động) kéo theo cấu tạo giá trị tăng, biểu hiện sự cạnh tranh gay gắt.
                </span>
              </div>

              {/* Production projection summary */}
              <div className="bg-black/50 p-3 rounded border border-neutral-800 space-y-2">
                <span className="text-gray-500 block">Dự Báo Sản Xuất Lượt Này</span>
                <div className="flex justify-between text-white">
                  <span>Giày Ra Lò:</span>
                  <span className="font-bold text-pink-400">+{shoesToProduce} đôi</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tồn Kho Cũ:</span>
                  <span>{useGame().shoesInStock} đôi</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tổng Chi Phí Trừ Vốn:</span>
                  <span className="text-red-400">-${(wagesCost).toLocaleString()} Lương</span>
                </div>
                <span className="text-[10px] text-gray-500 block border-t border-neutral-900 pt-1.5 leading-normal">
                  {shoesToProduce === 0 && (
                    <span className="text-error flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Chưa mua vật liệu hoặc không có công nhân!
                    </span>
                  )}
                  {shoesToProduce > 0 && shoesToProduce < materials && (
                    <span className="text-warning">
                      ⚠️ Bị giới hạn công suất! Thiếu công nhân hoặc chưa nâng cấp máy. Tồn dư {materials - shoesToProduce} bộ da chưa làm.
                    </span>
                  )}
                  {shoesToProduce > 0 && shoesToProduce === materials && (
                    <span className="text-success">
                      ✓ Đạt hiệu năng tối đa! Sử dụng toàn bộ nguyên liệu trong kho.
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Production Setup */}
          <button
            onClick={submitProduction}
            disabled={workers === 0}
            className="btn btn-block btn-lg bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-black font-bold font-mono tracking-wider shadow-lg shadow-emerald-500/10"
          >
            BẮT ĐẦU SẢN XUẤT <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
