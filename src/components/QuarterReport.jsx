import React from 'react';
import { useGame } from '../context/GameContext';
import { FileSpreadsheet, TrendingUp, ShieldAlert, Sparkles, Building, ArrowRight } from 'lucide-react';

export default function QuarterReport() {
  const {
    round,
    roundResult,
    funds,
    aiCompetitors,
    startNextRound,
    event
  } = useGame();

  if (!roundResult) return null;

  const { production, sales, playerStateSnapshot, eventSnapshot } = roundResult;

  // Economic calculations
  const totalCost = production.totalCost;
  const revenue = sales.revenue;
  const holdingCost = sales.holdingCost;
  const netProfit = sales.netProfit;

  return (
    <div className="space-y-6 font-mono text-left">
      {/* Header title */}
      <div className="text-center py-2 border-b border-cyan-950">
        <h2 className="text-2xl font-bold text-cyan-400 glow-text-cyan uppercase">
          BÁO CÁO TÀI CHÍNH QUÝ {round} (QUÁ TRÌNH LƯU THÔNG KHÉP KÍN)
        </h2>
        <p className="text-xs text-pink-400 mt-1">
          Bản cân đối kế toán & Báo cáo thặng dư tư bản
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ledger Column */}
        <div className="card bg-neutral-900/80 border border-cyan-900/40 p-5 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 border-b border-cyan-950 pb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> PHÂN TÍCH DÒNG VỐN CÁ BIỆT (BẠN)
          </h3>

          <div className="space-y-2.5 text-xs text-gray-300">
            {/* Start capital */}
            <div className="flex justify-between">
              <span>Vốn ban đầu quý:</span>
              <span className="font-bold text-white">${playerStateSnapshot.fundsBefore?.toLocaleString()}</span>
            </div>

            {/* Production costs */}
            <div className="bg-black/50 p-2.5 rounded border border-neutral-950 space-y-1.5">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">1. Chi phí sản xuất (Tư bản ứng trước)</span>
              
              <div className="flex justify-between pl-2">
                <span>- Tư bản bất biến (c - nguyên liệu):</span>
                <span className="text-red-400">-${production.materialsCost?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>- Tư bản khả biến (v - tiền lương):</span>
                <span className="text-red-400">-${production.wagesCost?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pl-2 font-bold border-t border-neutral-900 pt-1 mt-1 text-gray-400">
                <span>Tổng chi phí vận hành (c + v):</span>
                <span>-${totalCost?.toLocaleString()}</span>
              </div>
            </div>

            {/* Sales revenue */}
            <div className="bg-black/50 p-2.5 rounded border border-neutral-950 space-y-1.5">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">2. Giai đoạn lưu thông (Bán hàng)</span>
              
              <div className="flex justify-between pl-2">
                <span>- Số giày sản xuất + tồn kho cũ:</span>
                <span className="text-white">{production.produced + sales.sales + sales.unsold} đôi</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>- Lượng hàng bán được (Cầu thực tế):</span>
                <span className="text-emerald-400 font-bold">+{sales.sales} đôi</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>- Lượng hàng tồn kho (Khủng hoảng thừa):</span>
                <span className="text-pink-400">{sales.unsold} đôi</span>
              </div>
              <div className="flex justify-between pl-2 font-bold border-t border-neutral-900 pt-1 mt-1 text-emerald-400">
                <span>Doanh thu thu về:</span>
                <span>+${revenue?.toLocaleString()}</span>
              </div>
            </div>

            {/* Other costs */}
            <div className="flex justify-between">
              <span>Phí lưu kho giày ế ($1/đôi):</span>
              <span className="text-red-400">-${holdingCost?.toLocaleString()}</span>
            </div>

            {/* Net Profits */}
            <div className="flex justify-between border-t border-cyan-950 pt-2.5 font-extrabold text-sm">
              <span>Lợi nhuận thặng dư ròng (m):</span>
              <span className={netProfit >= 0 ? 'text-emerald-400 glow-text-green' : 'text-red-500'}>
                {netProfit >= 0 ? '+' : ''}${netProfit?.toLocaleString()}
              </span>
            </div>

            {/* End capital */}
            <div className="flex justify-between border-t border-cyan-950 pt-2 font-extrabold text-sm text-cyan-400">
              <span>Vốn khả dụng cuối quý:</span>
              <span className="glow-text-cyan">${playerStateSnapshot.fundsAfter?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Competitor standings Column */}
        <div className="card bg-neutral-900/80 border border-pink-900/40 p-5 space-y-4">
          <h3 className="text-sm font-bold text-pink-400 border-b border-pink-950 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4" /> BÁO CÁO CẠNH TRANH TOÀN THỊ TRƯỜNG
          </h3>

          <div className="space-y-3.5 text-xs">
            {aiCompetitors.map(ai => (
              <div
                key={ai.id}
                className={`p-3 rounded border ${ai.bankrupt ? 'bg-red-950/10 border-red-900/40' : 'bg-black/50 border-neutral-800'}`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className={ai.bankrupt ? 'text-red-500 line-through' : 'text-white'}>{ai.name}</span>
                  {ai.bankrupt ? (
                    <span className="badge badge-error badge-xs font-bold text-black py-1">PHÁ SẢN</span>
                  ) : (
                    <span className="text-emerald-400">${ai.funds?.toLocaleString()}</span>
                  )}
                </div>

                {!ai.bankrupt && (
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-gray-400">
                    <div>
                      <span>Định giá: </span>
                      <span className="font-bold text-white">${ai.price}</span>
                    </div>
                    <div>
                      <span>Bán được: </span>
                      <span className="font-bold text-white">{ai.sales} đôi</span>
                    </div>
                    <div>
                      <span>Tồn kho: </span>
                      <span className="font-bold text-pink-400">{ai.stock} đôi</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Macro Event for the next round */}
      <div className={`card bg-neutral-950 border border-${event.color || 'warning'}-500 p-5 space-y-3 relative overflow-hidden`}>
        {/* Glowing border simulation */}
        <div className={`absolute top-0 left-0 w-1 h-full bg-${event.color || 'warning'}-500`}></div>
        
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 text-${event.color || 'warning'}-500 animate-pulse`} />
          <h3 className={`font-extrabold text-sm uppercase text-${event.color || 'warning'}-500 tracking-wider`}>
            QUÝ TIẾP THEO: {event.name}
          </h3>
        </div>

        <p className="text-xs text-white leading-relaxed font-bold">
          {event.desc}
        </p>

        {/* Marxist Economic explanation */}
        <div className="bg-black/40 p-3 rounded border border-neutral-900 text-[11px] text-gray-400 leading-relaxed space-y-1">
          <span className="font-bold text-cyan-400 block">📚 GIẢI THÍCH QUY LUẬT KINH TẾ:</span>
          <p>{event.law}</p>
        </div>
      </div>

      {/* Advance button */}
      <div className="text-right">
        <button
          onClick={startNextRound}
          className="btn btn-lg bg-cyan-600 hover:bg-cyan-700 border-cyan-500 text-white font-mono font-bold uppercase tracking-wider"
        >
          TIẾN VÀO QUÝ TIẾP THEO <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
