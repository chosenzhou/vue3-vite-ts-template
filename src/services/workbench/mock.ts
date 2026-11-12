import type { CustomerMetrics, GoalItem, Period, SalesDashboard } from './types';

// OpenDesign 原始演示数据；预测字段保持原文，业务口径待后端确认。
export const CATS = [
  { name: '化学药制剂', color: 'var(--cat-1)' },
  { name: '中成药', color: 'var(--cat-2)' },
  { name: '中药饮片', color: 'var(--cat-3)' },
  { name: '医疗器械', color: 'var(--cat-4)' },
  { name: '其他品类', color: 'var(--cat-5)' },
];

export const CUSTOMERS = [
  {
    name: '康宁大药房连锁',
    cat: '连锁药店',
    spark: [0.72, 0.81, 0.76, 0.88, 0.84, 0.95, 1],
  },
  {
    name: '市第一人民医院',
    cat: '医院',
    spark: [0.65, 0.7, 0.85, 0.78, 0.9, 0.86, 1],
  },
  {
    name: '百姓药房连锁',
    cat: '连锁药店',
    spark: [0.8, 0.74, 0.9, 0.83, 0.96, 0.9, 1],
  },
  {
    name: '仁济医院',
    cat: '医院',
    spark: [0.7, 0.62, 0.78, 0.66, 0.8, 0.72, 1],
  },
  {
    name: '惠民诊所连锁',
    cat: '诊所连锁',
    spark: [0.6, 0.68, 0.64, 0.76, 0.7, 0.9, 1],
  },
  {
    name: '惠仁堂大药房',
    cat: '连锁药店',
    spark: [0.62, 0.7, 0.66, 0.78, 0.74, 0.86, 1],
  },
  {
    name: '市中心医院',
    cat: '医院',
    spark: [0.7, 0.64, 0.8, 0.72, 0.9, 0.84, 1],
  },
  {
    name: '健民医药连锁',
    cat: '连锁药店',
    spark: [0.58, 0.66, 0.62, 0.74, 0.7, 0.88, 1],
  },
];

const snapshots = {
  today: {
    sales: 186.5,
    orders: 342,
    rate: 66.6,
    deltas: [
      { dir: 'up', text: '较昨日 ↑ 8.2%' },
      { dir: 'up', text: '较昨日 ↑ 5.6%' },
      { dir: 'down', text: '较昨日 ↓ 1.8pt' },
    ],
    trendLabels: [
      '11/06',
      '11/07',
      '11/08',
      '11/09',
      '11/10',
      '11/11',
      '今天',
    ],
    trend: [
      152.4,
      168.9,
      121.7,
      134.2,
      171.5,
      163.8,
      186.5,
    ],
    trendSub: '近7日 · 单位：万元',
    cats: [42, 23, 14, 13, 8],
    catAmts: [78.3, 42.9, 26.1, 24.2, 15.0],
    rank: [
      {
        amt: 23.6,
        delta: 12.4,
        orders: 58,
        rate: 71,
      },
      {
        amt: 20.8,
        delta: 6.2,
        orders: 47,
        rate: 64,
      },
      {
        amt: 18.4,
        delta: 9.8,
        orders: 63,
        rate: 77,
      },
      {
        amt: 16.5,
        delta: -2.1,
        orders: 22,
        rate: 58,
      },
      {
        amt: 14.1,
        delta: 4.3,
        orders: 36,
        rate: 69,
      },
      {
        amt: 12.8,
        delta: 3.6,
        orders: 31,
        rate: 62,
      },
      {
        amt: 11.4,
        delta: -4.2,
        orders: 19,
        rate: 55,
      },
      {
        amt: 9.6,
        delta: 8.1,
        orders: 27,
        rate: 66,
      },
    ],
  },
  week: {
    sales: 1286.4,
    orders: 1798,
    rate: 71.2,
    deltas: [
      { dir: 'up', text: '较上周 ↑ 7.4%' },
      { dir: 'up', text: '较上周 ↑ 3.1%' },
      { dir: 'up', text: '较上周 ↑ 2.6pt' },
    ],
    trendLabels: ['W45', 'W46', 'W47', '本周'],
    trend: [1102.6, 1187.3, 1246.8, 1286.4],
    trendSub: '近4周 · 单位：万元',
    cats: [41, 24, 13, 14, 8],
    catAmts: [527.4, 308.7, 167.2, 180.1, 103.0],
    rank: [
      {
        amt: 161.2,
        delta: 11.8,
        orders: 312,
        rate: 73,
      },
      {
        amt: 140.6,
        delta: 5.4,
        orders: 286,
        rate: 68,
      },
      {
        amt: 124.7,
        delta: 14.2,
        orders: 401,
        rate: 81,
      },
      {
        amt: 111.3,
        delta: -3.6,
        orders: 98,
        rate: 59,
      },
      {
        amt: 95.2,
        delta: 6.1,
        orders: 214,
        rate: 71,
      },
      {
        amt: 88.4,
        delta: 4.7,
        orders: 176,
        rate: 64,
      },
      {
        amt: 79.3,
        delta: -2.8,
        orders: 141,
        rate: 57,
      },
      {
        amt: 66.8,
        delta: 9.2,
        orders: 203,
        rate: 69,
      },
    ],
  },
  month: {
    sales: 5432.8,
    orders: 7652,
    rate: 72.4,
    deltas: [
      { dir: 'up', text: '较上月 ↑ 2.8%' },
      { dir: 'up', text: '较上月 ↑ 4.2%' },
      { dir: 'up', text: '较上月 ↑ 1.9pt' },
    ],
    trendLabels: ['6月', '7月', '8月', '9月', '10月', '11月'],
    trend: [
      4612.5,
      4488.2,
      4937.6,
      5105.3,
      5286.1,
      5432.8,
    ],
    trendSub: '近6月 · 单位：万元',
    cats: [42, 23, 14, 13, 8],
    catAmts: [2281.8, 1249.5, 760.6, 706.3, 434.6],
    rank: [
      {
        amt: 682.4,
        delta: 12.6,
        orders: 1856,
        rate: 84,
      },
      {
        amt: 596.8,
        delta: 8.3,
        orders: 903,
        rate: 76,
      },
      {
        amt: 528.2,
        delta: 15.1,
        orders: 2104,
        rate: 88,
      },
      {
        amt: 472.5,
        delta: -3.2,
        orders: 512,
        rate: 61,
      },
      {
        amt: 401.6,
        delta: 5.4,
        orders: 977,
        rate: 72,
      },
      {
        amt: 372.5,
        delta: 6.8,
        orders: 812,
        rate: 67,
      },
      {
        amt: 333.1,
        delta: -1.6,
        orders: 648,
        rate: 58,
      },
      {
        amt: 281.7,
        delta: 10.4,
        orders: 921,
        rate: 70,
      },
    ],
  },
};

export const TEAMS: GoalItem[] = [
  {
    name: '华东一区',
    pct: 86.1,
    done: 2066.4,
    target: 2400,
  },
  {
    name: '华东二区',
    pct: 74.0,
    done: 1479.2,
    target: 2000,
  },
  {
    name: '华南区',
    pct: 65.2,
    done: 1043.1,
    target: 1600,
  },
  {
    name: '华北区',
    pct: 56.3,
    done: 844.1,
    target: 1500,
  },
];
export const CAT_PROG: GoalItem[] = [
  {
    name: '化学药制剂',
    color: 'var(--cat-1)',
    pct: 72.4,
    done: 2281.8,
    target: 3150,
  },
  {
    name: '中成药',
    color: 'var(--cat-2)',
    pct: 73.5,
    done: 1249.5,
    target: 1700,
  },
  {
    name: '中药饮片',
    color: 'var(--cat-3)',
    pct: 76.1,
    done: 760.6,
    target: 1000,
  },
  {
    name: '医疗器械及其他',
    color: 'var(--cat-4)',
    pct: 69.1,
    done: 1140.9,
    target: 1650,
  },
];

export const GOALS = {
  rate: 72.4,
  target: 7500,
  done: 5432.8,
  remaining: 2067.2,
  days: 18,
  dailyRequired: 114.8,
  forecastRate: 108.7,
  daily: 452.7,
  forecast: 8149,
  teams: TEAMS,
  categories: CAT_PROG,
};

function withCustomers(snapshot: Omit<SalesDashboard, 'rank'> & { rank: CustomerMetrics[] }): SalesDashboard {
  return {
    ...snapshot,
    rank: snapshot.rank.map((row, index) => ({
      ...row,
      customer: { ...CUSTOMERS[index]!, id: `customer-${index + 1}` },
    })),
  };
}
export const DASH: Record<Period, SalesDashboard> = {
  today: withCustomers(snapshots.today),
  week: withCustomers(snapshots.week),
  month: withCustomers(snapshots.month),
};
