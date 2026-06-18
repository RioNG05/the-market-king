import React, { useState, useEffect } from 'react';
import { useGame, playSound } from '../context/GameContext';
import { TrendingUp, BarChart3, HelpCircle, ArrowRight, Play, ShoppingCart } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesPhase() {
  const {
    teamName,
    shoesInStock,
    salesPrice,
    setSalesPrice,
    aiCompetitors,
    submitSales,
    event,
    soundOn
  } = useGame();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [coins, setCoins] = useState([]);
  const [showChartType, setShowChartType] = useState('demand'); // 'demand' or 'comparison'

  // Pre-calculate AI prices for reference preview
  // Traditional: higher, Standard: average, Automation: low
  const standardAI = aiCompetitors.find(ai => ai.id === 'ai_standard') || { price: 35 };
  const automationAI = aiCompetitors.find(ai => ai.id === 'ai_automation') || { price: 26 };
  const traditionalAI = aiCompetitors.find(ai => ai.id === 'ai_traditional') || { price: 50 };

  const averageMarketPrice = Math.round(
    (salesPrice + standardAI.price + automationAI.price + traditionalAI.price) / 4
  );

  // Trigger simulation sequence
  const handleStartSales = () => {
    setIsSimulating(true);
    setSimulationStep(1);
    setSimulationLogs(['[CONNECTING TO CENTRAL OPEN MARKETPLACE...]']);

    // Play initial event buzz if event isn't stable
    if (event.id !== 'STABLE') {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, `[CẢNH BÁO VĨ MÔ: Vận hành dưới tác động: ${event.name}]`]);
      }, 400);
    }
  };

  // Run the simulation steps
  useEffect(() => {
    if (!isSimulating) return;

    if (simulationStep === 1) {
      const timer = setTimeout(() => {
        setSimulationLogs(prev => [...prev, '[PHÂN TÍCH SỨC MUA XÃ HỘI (CẦU CỰC BỘ)...]']);
        setSimulationStep(2);
      }, 700);
      return () => clearTimeout(timer);
    }

    if (simulationStep === 2) {
      const timer = setTimeout(() => {
        setSimulationLogs(prev => [...prev, '[SO SÁNH ĐỊNH GIÁ & CẠNH TRANH CỦA CÁC XƯỞNG...]']);
        setSimulationStep(3);
      }, 700);
      return () => clearTimeout(timer);
    }

    if (simulationStep === 3) {
      const timer = setTimeout(() => {
        setSimulationLogs(prev => [...prev, '[KHOÁ KHỚP HỢP ĐỒNG GIAO DỊCH...]']);
        setSimulationStep(4);
      }, 600);
      return () => clearTimeout(timer);
    }

    if (simulationStep === 4) {
      // Complete simulation & process sales
      // Trigger coins explosion if shoes were sold
      if (shoesInStock > 0 && salesPrice < 85) {
        // Spawn multiple gold coins on the screen
        const newCoins = [];
        const coinCount = Math.min(20, Math.max(5, Math.ceil(shoesInStock / 10)));
        
        for (let i = 0; i < coinCount; i++) {
          newCoins.push({
            id: i,
            x: Math.random() * 200 - 100 + window.innerWidth / 2,
            y: Math.random() * 100 - 50 + window.innerHeight / 2
          });
        }
        setCoins(newCoins);

        // Sound effect chain
        playSound('cash', soundOn);
        setTimeout(() => playSound('cash', soundOn), 150);
        setTimeout(() => playSound('cash', soundOn), 300);
      } else {
        // Overpriced warning sound
        playSound('error', soundOn);
      }

      const timer = setTimeout(() => {
        setIsSimulating(false);
        setSimulationStep(0);
        submitSales();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isSimulating, simulationStep]);

  // Clean coins after animation
  useEffect(() => {
    if (coins.length > 0) {
      const timer = setTimeout(() => {
        setCoins([]);
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [coins]);

  // Chart 1: Market Demand Curve
  // Qd = BaseDemand * e^(-beta * Price)
  // Base demand varies on event
  const demandMult = event ? event.demandMultiplier : 1.0;
  const baseDemand = 1000 * demandMult;
  
  let beta = 0.07;
  if (event && event.id === 'LOCKDOWN') beta = 0.13;
  if (event && event.id === 'BOOM') beta = 0.04;

  const pricesRange = Array.from({ length: 15 }, (_, i) => 10 + i * 5); // 10 to 80
  const demandCurvePoints = pricesRange.map(p => Math.round(baseDemand * Math.exp(-beta * p)));

  // Calculate player's demand share point
  // For visual simplified tracking, we plot Player Price on the general Demand Curve
  const playerExpectedDemand = Math.round(baseDemand * Math.exp(-beta * salesPrice));

  const demandChartData = {
    labels: pricesRange.map(p => `$${p}`),
    datasets: [
      {
        label: 'Đường cầu thị trường (Qd)',
        data: demandCurvePoints,
        borderColor: '#ff007f',
        backgroundColor: 'rgba(255, 0, 127, 0.15)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2,
      },
      {
        label: 'Bạn (Vị thế của bạn)',
        data: pricesRange.map(p => p === Math.round(salesPrice / 5) * 5 ? playerExpectedDemand : null),
        borderColor: '#00f0ff',
        backgroundColor: '#00f0ff',
        pointRadius: 7,
        pointHoverRadius: 9,
        showLine: false,
      }
    ]
  };

  const demandChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#c7c9d3', font: { family: 'ui-monospace' } }
      },
      title: {
        display: true,
        text: 'QUY LUẬT CẦU: GIÁ BÁN TĂNG THÌ CẦU GIẢM',
        color: '#ff007f',
        font: { family: 'Rajdhani', size: 14, weight: 'bold' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#c7c9d3', font: { family: 'ui-monospace' } },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#c7c9d3', font: { family: 'ui-monospace' } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        title: {
          display: true,
          text: 'Sức Mua (Đôi giày)',
          color: '#c7c9d3'
        }
      }
    }
  };

  // Chart 2: Competitor Price Comparison Chart
  const comparisonChartData = {
    labels: [
      'Xưởng Tốc Độ (Auto AI)',
      'Xưởng Thành Công (Standard AI)',
      `${teamName} (Bạn)`,
      'Xưởng Thủ Công (Manual AI)'
    ],
    datasets: [
      {
        label: 'Đơn giá giày ($)',
        data: [
          automationAI.price,
          standardAI.price,
          salesPrice,
          traditionalAI.price
        ],
        backgroundColor: [
          'rgba(0, 240, 255, 0.4)', // cyan
          'rgba(57, 255, 20, 0.4)',  // neon green
          'rgba(255, 0, 127, 0.6)',  // neon pink (player)
          'rgba(255, 230, 0, 0.4)'   // neon yellow
        ],
        borderColor: [
          '#00f0ff',
          '#39ff14',
          '#ff007f',
          '#ffe600'
        ],
        borderWidth: 2
      }
    ]
  };

  const comparisonChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'SO SÁNH BẢNG GIÁ THỊ TRƯỜNG LƯỢT NÀY',
        color: '#00f0ff',
        font: { family: 'Rajdhani', size: 14, weight: 'bold' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#c7c9d3', font: { family: 'ui-monospace' } },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#c7c9d3', font: { family: 'ui-monospace' } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        title: {
          display: true,
          text: 'Giá bán ($)',
          color: '#c7c9d3'
        }
      }
    }
  };

  return (
    <div className="space-y-6 font-mono text-left relative">
      {/* Simulation Screen Overlay */}
      {isSimulating && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center space-y-6">
          <div className="card w-96 p-6 border border-cyan-500 bg-neutral-950 glow-border-cyan space-y-4">
            <h3 className="text-cyan-400 font-extrabold tracking-widest text-center flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5 animate-pulse" /> SỬ LÝ GIAO DỊCH THỊ TRƯỜNG
            </h3>
            <div className="bg-black p-4 rounded border border-neutral-800 h-40 overflow-y-auto text-xs text-cyan-500 space-y-2 select-none">
              {simulationLogs.map((log, idx) => (
                <div key={idx} className="typing-effect">{log}</div>
              ))}
            </div>
            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${(simulationStep / 4) * 100}%`, transition: 'width 0.5s ease' }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Coins Effect */}
      {coins.map(coin => (
        <span
          key={coin.id}
          className="floating-coin"
          style={{ left: `${coin.x}px`, top: `${coin.y}px` }}
        >
          🪙
        </span>
      ))}

      {/* Top Banner info */}
      <div className="bg-neutral-900/60 border border-pink-900/40 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-pink-400 uppercase font-bold block mb-1">📦 CUNG HÀNG HÓA SẴN CÓ</span>
          <p className="text-gray-300 text-xs">
            Tổng giày đang lưu kho: <span className="text-white font-bold text-lg">{shoesInStock} đôi</span>
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-black/50 py-1.5 px-3 rounded border border-neutral-800 text-center">
            <span className="text-[10px] text-gray-500 block">AI GIÁ THẤP NHẤT</span>
            <span className="text-xs font-bold text-cyan-400">${automationAI.price}/đôi</span>
          </div>
          <div className="bg-black/50 py-1.5 px-3 rounded border border-neutral-800 text-center">
            <span className="text-[10px] text-gray-500 block">AI GIÁ CAO NHẤT</span>
            <span className="text-xs font-bold text-yellow-400">${traditionalAI.price}/đôi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Price control */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card cyber-panel p-5 glow-border-cyan space-y-6">
            <div className="flex justify-between items-center border-b border-cyan-950 pb-2">
              <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> THIẾT LẬP ĐƠN GIÁ BÁN
              </h3>
              <div className="tooltip tooltip-left" data-tip="Dựa vào Quy luật Cung - Cầu, nếu đặt giá thấp, bạn bán được nhiều hàng nhưng lợi nhuận biên thấp. Đặt giá quá cao khiến hàng bị ế (Khủng hoảng thừa).">
                <HelpCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
              </div>
            </div>

            {/* Slider control */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs text-gray-400">Giá bán giày cá biệt:</span>
                <span className="text-3xl font-extrabold text-cyan-400 glow-text-cyan">
                  ${salesPrice}
                  <span className="text-xs text-gray-500 font-normal ml-1">/đôi</span>
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="90"
                value={salesPrice}
                onChange={(e) => setSalesPrice(Number(e.target.value))}
                className="range range-primary"
              />

              <div className="flex justify-between text-[10px] text-gray-500">
                <span>$10 (Kịch sàn)</span>
                <span>$50 (Trung bình)</span>
                <span>$90 (Cực đắt)</span>
              </div>
            </div>

            {/* Feedback Analysis */}
            <div className="bg-black/50 p-4 rounded border border-neutral-800 space-y-2 text-xs">
              <span className="text-gray-500 block border-b border-neutral-900 pb-1">KỊCH BẢN THỊ TRƯỜNG DỰ KIẾN:</span>
              
              <div className="flex justify-between">
                <span>Giá trung bình thị trường:</span>
                <span className="text-white font-bold">${averageMarketPrice}/đôi</span>
              </div>

              <div className="flex justify-between">
                <span>Giá của bạn so với thị trường:</span>
                <span>
                  {salesPrice < averageMarketPrice * 0.85 ? (
                    <span className="text-emerald-400 font-bold">RẺ HƠN RẤT NHIỀU</span>
                  ) : salesPrice > averageMarketPrice * 1.15 ? (
                    <span className="text-error font-bold">QUÁ ĐẮT (DỄ TỒN KHO)</span>
                  ) : (
                    <span className="text-primary font-bold">TƯƠNG ĐƯƠNG CẠNH TRANH</span>
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-900 text-gray-400 leading-normal">
                {salesPrice > 65 && (
                  <span className="text-error block">
                    ⚠️ Mức giá cực cao! Bạn đang đi ngược quy luật thị trường, có nguy cơ tồn kho cực lớn nếu các đối thủ AI vẫn còn hàng.
                  </span>
                )}
                {salesPrice <= 65 && salesPrice > 45 && (
                  <span className="text-warning block">
                    ✓ Mức giá cao. Bạn chỉ bán được hàng cho phân khúc khách hàng nhỏ, hoặc khi đối thủ hết hàng.
                  </span>
                )}
                {salesPrice <= 45 && (
                  <span className="text-success block">
                    ✓ Mức giá cạnh tranh cao! Bạn sẽ thu hút lượng Cầu lớn từ người tiêu dùng, hàng hóa bán rất nhanh.
                  </span>
                )}
              </div>
            </div>

            {/* Start selling button */}
            <button
              onClick={handleStartSales}
              disabled={shoesInStock === 0}
              className="btn btn-block btn-lg bg-pink-600 hover:bg-pink-700 border-pink-500 text-white font-bold font-mono tracking-wider shadow-lg shadow-pink-500/10"
            >
              <Play className="w-4 h-4 fill-current mr-2" /> BẮT ĐẦU BÁN HÀNG
            </button>
            
            {shoesInStock === 0 && (
              <span className="text-[10px] text-error text-center block">
                ⚠️ Không có giày tồn kho để bán! Nhấn nút để bỏ qua lượt bán này.
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Chart.js visualizations */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card bg-neutral-900/60 border border-pink-900/40 p-5 space-y-4">
            {/* Chart toggle controls */}
            <div className="flex justify-between items-center border-b border-pink-950 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-widest text-pink-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> BIỂU ĐỒ CHỈ BÁO THỊ TRƯỜNG
              </h3>
              <div className="join">
                <button
                  onClick={() => setShowChartType('demand')}
                  className={`btn btn-xs join-item font-mono ${showChartType === 'demand' ? 'btn-secondary text-white' : ''}`}
                >
                  ĐƯỜNG CẦU (LAW OF DEMAND)
                </button>
                <button
                  onClick={() => setShowChartType('comparison')}
                  className={`btn btn-xs join-item font-mono ${showChartType === 'comparison' ? 'btn-secondary text-white' : ''}`}
                >
                  SO SÁNH BẢNG GIÁ
                </button>
              </div>
            </div>

            {/* Display Chart */}
            <div className="bg-black/60 p-2 rounded border border-neutral-950 min-h-[260px] flex items-center justify-center">
              {showChartType === 'demand' ? (
                <Line data={demandChartData} options={demandChartOptions} />
              ) : (
                <Bar data={comparisonChartData} options={comparisonChartOptions} />
              )}
            </div>

            {/* Footnotes on economic logic */}
            <div className="text-[10px] text-gray-500 leading-normal flex items-start gap-1">
              <span>*</span>
              <p>
                {showChartType === 'demand' ? (
                  'Đường màu hồng mô phỏng Quy luật Cầu: Khi giá sản phẩm tăng lên, lượng cầu của người tiêu dùng sẽ giảm đi. Chấm xanh dương thể hiện mức định giá của bạn.'
                ) : (
                  'Sử dụng dữ liệu giá này làm căn cứ cạnh tranh. Xưởng Tốc Độ (AI) có máy móc tiên tiến nên luôn có xu hướng bán giá rẻ để thu hút Cầu, ép các xưởng thủ công phá sản.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
