// Economic Engine for THE MARKET KING (Vua Thị Trường)

// Define AI Competitor archetypes
export const AI_TYPES = {
  STANDARD: 'standard',
  AUTOMATION: 'automation',
  TRADITIONAL: 'traditional'
};

export const EVENTS = {
  STABLE: {
    id: 'STABLE',
    name: 'Kinh Tế Ổn Định',
    desc: 'Thị trường không có biến động lớn. Hãy tối ưu sản xuất.',
    demandMultiplier: 1.0,
    costMultiplier: 1.0,
    color: 'success',
    law: 'Quy luật Cung - Cầu & Quy luật Giá trị chi phối thị trường bình thường.'
  },
  INFLATION: {
    id: 'INFLATION',
    name: 'Lạm Phát Phi Mã',
    desc: 'Ngân hàng in nhiều tiền cứu trợ. Giá nguyên liệu đầu vào tăng 200%!',
    demandMultiplier: 1.1, // slightly higher nominal spending
    costMultiplier: 2.0,
    color: 'warning',
    law: 'Quy luật Lưu thông Tiền tệ: Khi lượng tiền mặt trong lưu thông vượt quá lượng tiền cần thiết, tiền mất giá, giá cả hàng hóa tăng vọt.'
  },
  LOCKDOWN: {
    id: 'LOCKDOWN',
    name: 'Đại Dịch & Phong Tỏa',
    desc: 'Sức mua toàn xã hội đột ngột sập 80%. Người tiêu dùng thắt chặt chi tiêu.',
    demandMultiplier: 0.2,
    costMultiplier: 1.0,
    color: 'error',
    law: 'Quy luật Cung - Cầu: Cầu sụt giảm nghiêm trọng khiến hàng hóa bị tồn kho (Khủng hoảng thừa). Doanh nghiệp phải đại hạ giá hoặc sa thải nhân công để sinh tồn.'
  },
  BOOM: {
    id: 'BOOM',
    name: 'Bùng Nổ Tiêu Dùng',
    desc: 'Xu hướng thời trang mới bùng nổ, sức mua thị trường tăng vọt 150%!',
    demandMultiplier: 1.5,
    costMultiplier: 1.0,
    color: 'secondary',
    law: 'Quy luật Cung - Cầu: Khi Cầu vượt Cung, người bán có quyền nâng giá để tối đa hóa lợi nhuận (Lợi nhuận siêu ngạch).'
  },
  TARIFFS: {
    id: 'TARIFFS',
    name: 'Chiến Tranh Thương Mại',
    desc: 'Thuế quan đánh vào da nhập khẩu tăng. Giá nguyên liệu đầu vào tăng 50%.',
    demandMultiplier: 1.0,
    costMultiplier: 1.5,
    color: 'info',
    law: 'Quy luật Giá trị: Thuế quan làm tăng chi phí mua tư bản bất biến (c), đẩy giá trị cá biệt và giá thành sản phẩm lên cao.'
  }
};

// Generate initial AI Competitors
export function generateInitialAIs() {
  return [
    {
      id: 'ai_standard',
      name: 'Xưởng Giày Thành Công (AI)',
      type: AI_TYPES.STANDARD,
      funds: 10000,
      workers: 3,
      upgraded: false,
      stock: 0,
      price: 35,
      sales: 0,
      revenue: 0,
      profit: 0,
      organicComposition: '1.50', // c/v
      laborTimePerShoe: 2.0, // hours
      bankrupt: false
    },
    {
      id: 'ai_automation',
      name: 'Xưởng Giày Tốc Độ (AI)',
      type: AI_TYPES.AUTOMATION,
      funds: 12000,
      workers: 2,
      upgraded: true, // starts with automatic machinery
      stock: 0,
      price: 26,
      sales: 0,
      revenue: 0,
      profit: 0,
      organicComposition: '4.50', // c/v is high
      laborTimePerShoe: 0.5, // hours
      bankrupt: false
    },
    {
      id: 'ai_traditional',
      name: 'Xưởng Giày Thủ Công (AI)',
      type: AI_TYPES.TRADITIONAL,
      funds: 8000,
      workers: 5,
      upgraded: false,
      stock: 0,
      price: 50,
      sales: 0,
      revenue: 0,
      profit: 0,
      organicComposition: '0.80', // c/v is low
      laborTimePerShoe: 3.0, // hours
      bankrupt: false
    }
  ];
}

// Simulate AI decisions for the Production Phase
export function runAIProduction(aiCompetitors, materialPrice, workerWage) {
  return aiCompetitors.map(ai => {
    if (ai.bankrupt || ai.funds <= 0) {
      return { ...ai, bankrupt: true, stock: 0, sales: 0, revenue: 0, profit: 0 };
    }

    // Base productivity variables
    const hoursPerQuarter = 480; // Total hours per worker in a quarter
    const laborTime = ai.upgraded ? 0.5 : (ai.type === AI_TYPES.TRADITIONAL ? 3.0 : 2.0);
    const capacityPerWorker = Math.floor(hoursPerQuarter / laborTime);
    
    // AI determines production scale based on funds
    let workers = ai.workers;
    let upgradeCost = 3000;
    
    // AI logic to upgrade sewing machine if they have enough money and aren't upgraded yet
    let upgraded = ai.upgraded;
    if (!upgraded && ai.funds > 8000) {
      upgraded = true;
      ai.funds -= upgradeCost;
    }
    
    // Max worker capacity
    let productionCapacity = workers * capacityPerWorker;
    
    // How many materials to buy? Try to produce near capacity but keep a cash reserve
    const maxMaterialsWithCash = Math.floor((ai.funds - (workers * workerWage)) / materialPrice);
    const targetProduction = Math.max(0, Math.min(productionCapacity, maxMaterialsWithCash, 400));
    
    const c_materials = targetProduction * materialPrice;
    const v_wages = workers * workerWage;
    const totalCost = c_materials + v_wages;
    
    // Update funds after production
    const fundsAfterProduction = ai.funds - totalCost;
    const stock = ai.stock + targetProduction; // add produced shoes to stock

    // Calculate Organic Composition of Capital (c/v)
    const c = c_materials + (upgraded ? 3000 / 15 : 0); // amortized machine cost + materials
    const v = v_wages;
    const organicComposition = v > 0 ? (c / v).toFixed(2) : '0.00';

    return {
      ...ai,
      workers,
      upgraded,
      stock,
      funds: fundsAfterProduction,
      organicComposition,
      laborTimePerShoe: laborTime,
      productionCostPerShoe: targetProduction > 0 ? (totalCost / targetProduction) : 30
    };
  });
}

// Simulate AI decisions for Setting Price
export function runAIPricing(aiCompetitors, event) {
  return aiCompetitors.map(ai => {
    if (ai.bankrupt) return ai;

    const baseCost = ai.productionCostPerShoe || 25;
    let targetPrice = baseCost * 1.25; // 25% markup standard

    // Pricing modifications based on inventory pressure
    if (ai.stock > 150) {
      targetPrice *= 0.8; // dump inventory (Law of supply demand)
    } else if (ai.stock < 10) {
      targetPrice *= 1.08; // high demand, raise price slightly
    }

    // Adapt to events
    if (event) {
      if (event.id === 'LOCKDOWN') {
        targetPrice *= 0.65; // drastic cut to sell anything
      } else if (event.id === 'BOOM') {
        targetPrice *= 1.25; // rise price because demand is high
      }
    }

    // Competitor archetypes specifics
    if (ai.type === AI_TYPES.AUTOMATION) {
      targetPrice *= 0.9; // Automation AI is highly aggressive with low prices
    } else if (ai.type === AI_TYPES.TRADITIONAL) {
      targetPrice *= 1.15; // Traditional AI has high labor cost, must price higher
    }

    // Ensure they don't price below material cost if they want to survive
    const minPrice = baseCost * 0.9;
    const finalPrice = Math.max(Math.round(targetPrice), Math.round(minPrice));

    return {
      ...ai,
      price: finalPrice
    };
  });
}

// Distribute market demand using soft-max price competition with stock constraints
export function distributeMarketDemand(player, aiCompetitors, baseDemand, event) {
  // Combine all active sellers
  const sellers = [];
  
  // Add player
  sellers.push({
    id: 'player',
    name: player.name,
    price: player.price,
    stock: player.stock,
    sales: 0,
    initialStock: player.stock
  });
  
  // Add AIs
  aiCompetitors.forEach(ai => {
    if (!ai.bankrupt) {
      sellers.push({
        id: ai.id,
        name: ai.name,
        price: ai.price,
        stock: ai.stock,
        sales: 0,
        initialStock: ai.stock
      });
    }
  });

  // Determine actual demand base based on event
  const eventMultiplier = event ? event.demandMultiplier : 1.0;
  let remainingDemand = Math.floor(baseDemand * eventMultiplier);
  
  // Price sensitivity factor (beta)
  // Higher beta means buyers are extremely price sensitive. Lower means they care less.
  let beta = 0.07;
  if (event && event.id === 'LOCKDOWN') {
    beta = 0.13; // extremely high price sensitivity in pandemic
  } else if (event && event.id === 'BOOM') {
    beta = 0.04; // buyers have cash, less price sensitive
  }

  // Iterative allocation to handle stock limitations
  let activeSellers = sellers.filter(s => s.stock > 0);
  let iterations = 0;
  
  while (remainingDemand > 0 && activeSellers.length > 0 && iterations < 10) {
    // 1. Calculate relative attraction for each active seller
    // attraction = e^(-beta * price)
    const attractionScores = activeSellers.map(s => {
      const att = Math.exp(-beta * s.price) * 1000;
      return {
        id: s.id,
        score: Math.max(att, 0.0001)
      };
    });

    const sumAttraction = attractionScores.reduce((sum, item) => sum + item.score, 0);

    // 2. Allocate remaining demand based on attraction shares
    const allocations = activeSellers.map(s => {
      const scoreObj = attractionScores.find(item => item.id === s.id);
      const share = scoreObj.score / sumAttraction;
      const demandShare = Math.floor(remainingDemand * share);
      return {
        seller: s,
        demand: demandShare
      };
    });

    let demandDistributedThisIteration = 0;
    
    // 3. Subtract stock and register sales
    allocations.forEach(alloc => {
      const s = alloc.seller;
      const d = alloc.demand;
      const actualSold = Math.min(d, s.stock);
      
      s.sales += actualSold;
      s.stock -= actualSold;
      demandDistributedThisIteration += actualSold;
    });

    remainingDemand -= demandDistributedThisIteration;

    // Recalculate active sellers (who still have stock)
    activeSellers = sellers.filter(s => s.stock > 0);
    iterations++;

    // Guard if demand distributed is zero (e.g. rounded to 0)
    if (demandDistributedThisIteration === 0 && remainingDemand > 0 && activeSellers.length > 0) {
      // Give remaining demand to the cheapest active seller
      const cheapest = activeSellers.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
      const finalSold = Math.min(remainingDemand, cheapest.stock);
      cheapest.sales += finalSold;
      cheapest.stock -= finalSold;
      remainingDemand -= finalSold;
      break;
    }
  }

  // Extract player result
  const playerResult = sellers.find(s => s.id === 'player');
  
  // Extract AI results
  const aiResults = aiCompetitors.map(ai => {
    const aiRes = sellers.find(s => s.id === ai.id);
    if (!aiRes) return { ...ai, sales: 0, profit: 0, revenue: 0 };
    
    const revenue = aiRes.sales * ai.price;
    // Holding cost for remaining stock
    const holdingCost = aiRes.stock * 1; // $1 per shoe
    const costOfProduction = (aiRes.initialStock - aiRes.stock) * (ai.productionCostPerShoe || 25);
    const profit = revenue - costOfProduction - holdingCost;
    const newFunds = Math.max(0, ai.funds + revenue - holdingCost);

    return {
      ...ai,
      stock: aiRes.stock,
      sales: aiRes.sales,
      revenue,
      profit,
      funds: newFunds,
      bankrupt: newFunds <= 0
    };
  });

  return {
    playerSales: playerResult ? playerResult.sales : 0,
    playerUnsold: playerResult ? playerResult.stock : 0,
    aiResults
  };
}

// Generate random events
export function generateRandomEvent(round) {
  if (round === 1) return EVENTS.STABLE; // round 1 is always stable to ease player in
  
  const roll = Math.random();
  if (roll < 0.40) return EVENTS.STABLE;
  if (roll < 0.60) return EVENTS.INFLATION;
  if (roll < 0.75) return EVENTS.LOCKDOWN;
  if (roll < 0.90) return EVENTS.BOOM;
  return EVENTS.TARIFFS;
}
