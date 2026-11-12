/* =====================================================================
   华康医药 · 企业微信 H5 销售数据看板 — 演示数据与交互逻辑
   注意：全部业务数据均为 Mock 演示数据，不来自真实接口。
   字段结构见 DESIGN.md「Mock 数据声明」，便于后续替换为 alova 请求。
   ===================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    var n = document.createElementNS(SVG_NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clearSvg(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }
  function fmtWan(v) { return v.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function fmtInt(v) { return Math.round(v).toLocaleString('zh-CN'); }
  function debounce(fn, ms) {
    var t = null;
    return function () {
      if (t) clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  /* ---------------- 演示数据 ---------------- */
  var CATS = [
    { name: '化学药制剂', color: 'var(--cat-1)' },
    { name: '中成药', color: 'var(--cat-2)' },
    { name: '中药饮片', color: 'var(--cat-3)' },
    { name: '医疗器械', color: 'var(--cat-4)' },
    { name: '其他品类', color: 'var(--cat-5)' }
  ];

  var CUSTOMERS = [
    { name: '康宁大药房连锁', cat: '连锁药店', spark: [0.72, 0.81, 0.76, 0.88, 0.84, 0.95, 1] },
    { name: '市第一人民医院', cat: '医院', spark: [0.65, 0.7, 0.85, 0.78, 0.9, 0.86, 1] },
    { name: '百姓药房连锁', cat: '连锁药店', spark: [0.8, 0.74, 0.9, 0.83, 0.96, 0.9, 1] },
    { name: '仁济医院', cat: '医院', spark: [0.7, 0.62, 0.78, 0.66, 0.8, 0.72, 1] },
    { name: '惠民诊所连锁', cat: '诊所连锁', spark: [0.6, 0.68, 0.64, 0.76, 0.7, 0.9, 1] },
    { name: '惠仁堂大药房', cat: '连锁药店', spark: [0.62, 0.7, 0.66, 0.78, 0.74, 0.86, 1] },
    { name: '市中心医院', cat: '医院', spark: [0.7, 0.64, 0.8, 0.72, 0.9, 0.84, 1] },
    { name: '健民医药连锁', cat: '连锁药店', spark: [0.58, 0.66, 0.62, 0.74, 0.7, 0.88, 1] }
  ];

  var DASH = {
    today: {
      sales: 186.5, orders: 342, rate: 66.6,
      deltas: [
        { dir: 'up', text: '较昨日 ↑ 8.2%' },
        { dir: 'up', text: '较昨日 ↑ 5.6%' },
        { dir: 'down', text: '较昨日 ↓ 1.8pt' }
      ],
      trendLabels: ['11/06', '11/07', '11/08', '11/09', '11/10', '11/11', '今天'],
      trend: [152.4, 168.9, 121.7, 134.2, 171.5, 163.8, 186.5],
      trendSub: '近7日 · 单位：万元',
      cats: [42, 23, 14, 13, 8],
      catAmts: [78.3, 42.9, 26.1, 24.2, 15.0],
      rank: [
        { amt: 23.6, delta: 12.4, orders: 58, rate: 71 },
        { amt: 20.8, delta: 6.2, orders: 47, rate: 64 },
        { amt: 18.4, delta: 9.8, orders: 63, rate: 77 },
        { amt: 16.5, delta: -2.1, orders: 22, rate: 58 },
        { amt: 14.1, delta: 4.3, orders: 36, rate: 69 },
        { amt: 12.8, delta: 3.6, orders: 31, rate: 62 },
        { amt: 11.4, delta: -4.2, orders: 19, rate: 55 },
        { amt: 9.6, delta: 8.1, orders: 27, rate: 66 }
      ]
    },
    week: {
      sales: 1286.4, orders: 1798, rate: 71.2,
      deltas: [
        { dir: 'up', text: '较上周 ↑ 7.4%' },
        { dir: 'up', text: '较上周 ↑ 3.1%' },
        { dir: 'up', text: '较上周 ↑ 2.6pt' }
      ],
      trendLabels: ['W45', 'W46', 'W47', '本周'],
      trend: [1102.6, 1187.3, 1246.8, 1286.4],
      trendSub: '近4周 · 单位：万元',
      cats: [41, 24, 13, 14, 8],
      catAmts: [527.4, 308.7, 167.2, 180.1, 103.0],
      rank: [
        { amt: 161.2, delta: 11.8, orders: 312, rate: 73 },
        { amt: 140.6, delta: 5.4, orders: 286, rate: 68 },
        { amt: 124.7, delta: 14.2, orders: 401, rate: 81 },
        { amt: 111.3, delta: -3.6, orders: 98, rate: 59 },
        { amt: 95.2, delta: 6.1, orders: 214, rate: 71 },
        { amt: 88.4, delta: 4.7, orders: 176, rate: 64 },
        { amt: 79.3, delta: -2.8, orders: 141, rate: 57 },
        { amt: 66.8, delta: 9.2, orders: 203, rate: 69 }
      ]
    },
    month: {
      sales: 5432.8, orders: 7652, rate: 72.4,
      deltas: [
        { dir: 'up', text: '较上月 ↑ 2.8%' },
        { dir: 'up', text: '较上月 ↑ 4.2%' },
        { dir: 'up', text: '较上月 ↑ 1.9pt' }
      ],
      trendLabels: ['6月', '7月', '8月', '9月', '10月', '11月'],
      trend: [4612.5, 4488.2, 4937.6, 5105.3, 5286.1, 5432.8],
      trendSub: '近6月 · 单位：万元',
      cats: [42, 23, 14, 13, 8],
      catAmts: [2281.8, 1249.5, 760.6, 706.3, 434.6],
      rank: [
        { amt: 682.4, delta: 12.6, orders: 1856, rate: 84 },
        { amt: 596.8, delta: 8.3, orders: 903, rate: 76 },
        { amt: 528.2, delta: 15.1, orders: 2104, rate: 88 },
        { amt: 472.5, delta: -3.2, orders: 512, rate: 61 },
        { amt: 401.6, delta: 5.4, orders: 977, rate: 72 },
        { amt: 372.5, delta: 6.8, orders: 812, rate: 67 },
        { amt: 333.1, delta: -1.6, orders: 648, rate: 58 },
        { amt: 281.7, delta: 10.4, orders: 921, rate: 70 }
      ]
    }
  };

  var TEAMS = [
    { name: '华东一区', pct: 86.1, done: 2066.4, target: 2400 },
    { name: '华东二区', pct: 74.0, done: 1479.2, target: 2000 },
    { name: '华南区', pct: 65.2, done: 1043.1, target: 1600 },
    { name: '华北区', pct: 56.3, done: 844.1, target: 1500 }
  ];
  var CAT_PROG = [
    { name: '化学药制剂', color: 'var(--cat-1)', pct: 72.4, done: 2281.8, target: 3150 },
    { name: '中成药', color: 'var(--cat-2)', pct: 73.5, done: 1249.5, target: 1700 },
    { name: '中药饮片', color: 'var(--cat-3)', pct: 76.1, done: 760.6, target: 1000 },
    { name: '医疗器械及其他', color: 'var(--cat-4)', pct: 69.1, done: 1140.9, target: 1650 }
  ];

  var HUB_TITLES = { stock: '库存数据', purchase: '采购数据', customer: '客户数据', payment: '回款数据', category: '品类分析' };
  var RATE = 72.4;

  /* ---------------- 元素引用 ---------------- */
  var kpiSales = $('#kpiSales'), kpiOrders = $('#kpiOrders'), kpiRate = $('#kpiRate');
  var kpiSalesDelta = $('#kpiSalesDelta'), kpiOrdersDelta = $('#kpiOrdersDelta'), kpiRateDelta = $('#kpiRateDelta');
  var trendSvg = $('#trendSvg'), trendSub = $('#trendSub'), trendCard = $('#trendCard');
  var donutSvg = $('#donutSvg'), donutLegend = $('#donutLegend');
  var rankList = $('#rankList'), rankMore = $('#rankMore');
  var sheet = $('#sheet'), scrim = $('#sheetScrim'), sheetBody = $('#sheetBody');
  var sheetTitle = $('#sheetTitle'), sheetChip = $('#sheetChip'), sheetClose = $('#sheetClose');
  var toast = $('#toast');
  var splash = $('#splash'), splashStatus = $('#splashStatus');
  var salesSub = $('#salesSub'), salesBack = $('#salesBack'), hubGrid = $('#hubGrid');
  var overviewStrip = $('#overviewStrip');
  var stateDemo = $('#stateDemo'), stateSeg = $('#stateSeg');
  var ringArc = $('#ringArc'), ringPct = $('#ringPct');

  var screens = { dash: $('#screen-dash'), target: $('#screen-target'), me: $('#screen-me') };
  var tabButtons = $$('.sidebar [data-tab], .tabbar [data-tab]');
  var segPeriods = $$('.seg-btn[data-p]');

  var period = 'today';
  var rankExpanded = false;
  var ringShown = false;
  var rafId = {};
  var lastFocus = null, closeTimer = null, toastTimer = null;

  /* ---------------- 通用渲染工具 ---------------- */
  function tween(key, node, to, fmt) {
    var from = typeof node._v === 'number' ? node._v : 0;
    node._v = to;
    if (rafId[key]) cancelAnimationFrame(rafId[key]);
    if (reduced || from === to) { node.textContent = fmt(to); return; }
    var t0 = performance.now(), dur = 380;
    function step(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(from + (to - from) * e);
      if (p < 1) { rafId[key] = requestAnimationFrame(step); } else { rafId[key] = null; }
    }
    rafId[key] = requestAnimationFrame(step);
  }

  function setDelta(node, d) {
    node.textContent = d.text;
    node.className = 'delta ' + d.dir;
  }

  /* ---------------- 趋势图（宽度自适应重绘） ---------------- */
  function removeTip(svg) {
    if (svg._tip && svg._tip.parentNode) svg._tip.parentNode.removeChild(svg._tip);
    svg._tip = null;
  }

  function showTip(svg, px, py, label, value, W) {
    removeTip(svg);
    var g = el('g', { 'pointer-events': 'none' }, svg);
    var t = el('text', {
      x: px, y: 0, 'text-anchor': 'middle', 'font-size': '11',
      'font-weight': '600', fill: '#FFFFFF'
    }, g);
    t.textContent = label + ' ' + fmtWan(value) + '万';
    var w = 0;
    try { w = t.getComputedTextLength() + 14; } catch (e) { w = 70; }
    var tx = Math.min(Math.max(px, 4 + w / 2), W - 4 - w / 2);
    var above = py - 32 > 4;
    var by = above ? py - 30 : py + 12;
    var r = el('rect', { x: tx - w / 2, y: by, width: w, height: 20, rx: 6, fill: '#111111' }, g);
    g.insertBefore(r, t);
    t.setAttribute('y', by + 14);
    svg._tip = g;
  }

  function drawTrend(svg, values, labels) {
    clearSvg(svg);
    removeTip(svg);
    var host = svg.closest('.card');
    var avail = host ? host.clientWidth - 32 : 335;
    var W = Math.max(300, Math.min(880, Math.round(avail || 335)));
    var H = W > 640 ? 210 : 172;
    var big = W > 640;
    var axisFs = big ? 11 : 10;
    var labFs = big ? 11 : 10;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('aria-label', '销售趋势折线图，' + labels[labels.length - 1] + ' ' + fmtWan(values[values.length - 1]) + ' 万元');

    var L = big ? 46 : 38, R = 12, T = 18, B = 28;
    var n = values.length;
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    var span = (max - min) || Math.abs(max) || 1;
    var lo = min - span * 0.35, hi = max + span * 0.12;
    function x(i) { return L + (W - L - R) * i / (n - 1); }
    function y(v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); }

    [0, 0.5, 1].forEach(function (s) {
      var gv = lo + s * (hi - lo), gy = y(gv);
      el('line', { x1: L, y1: gy, x2: W - R, y2: gy, stroke: 'rgba(217, 222, 231, .7)', 'stroke-width': 1 }, svg);
      var lbl = el('text', { x: L - 6, y: gy + 3.5, 'text-anchor': 'end', 'font-size': axisFs, fill: 'var(--muted)' }, svg);
      lbl.textContent = fmtInt(gv);
    });

    var pts = values.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); });
    var line = 'M' + pts.join(' L');
    var area = line + ' L' + x(n - 1).toFixed(1) + ',' + (H - B) + ' L' + x(0).toFixed(1) + ',' + (H - B) + ' Z';
    el('path', { d: area, fill: 'rgba(22,119,255,0.10)', stroke: 'none' }, svg);
    el('path', { d: line, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);

    values.forEach(function (v, i) {
      var c = el('circle', {
        cx: x(i).toFixed(1), cy: y(v).toFixed(1), r: i === n - 1 ? 4 : 3,
        fill: i === n - 1 ? 'var(--accent)' : '#FFFFFF',
        stroke: 'var(--accent)', 'stroke-width': 1.6, 'class': 'dot'
      }, svg);
      c.setAttribute('tabindex', '0');
      c.setAttribute('role', 'button');
      c.setAttribute('aria-label', labels[i] + '：' + fmtWan(v) + ' 万元，查看数值');
      var title = el('title', {}, c);
      title.textContent = labels[i] + '：' + fmtWan(v) + ' 万元';
      var openTip = function () {
        if (svg._tip && svg._tip._i === i) { removeTip(svg); return; }
        showTip(svg, x(i), y(v), labels[i], v, W);
        if (svg._tip) svg._tip._i = i;
      };
      c.addEventListener('click', openTip);
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTip(); }
      });
    });

    var step = n > 8 ? 2 : (n > 6 ? 1 : 0);
    labels.forEach(function (lb, i) {
      if (step && i % 2 === 1 && i !== n - 1) return;
      var t = el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', 'font-size': labFs, fill: 'var(--muted)' }, svg);
      t.textContent = lb;
    });
  }

  /* ---------------- 品类环形图 ---------------- */
  function drawDonut(svg, pcts, total) {
    clearSvg(svg);
    var g = el('g', { transform: 'rotate(-90 54 54)' }, svg);
    var cum = 0;
    pcts.forEach(function (p, i) {
      var len = Math.max(p - 1.4, 1);
      el('circle', {
        cx: 54, cy: 54, r: 40, fill: 'none',
        stroke: CATS[i].color, 'stroke-width': 13,
        pathLength: 100,
        'stroke-dasharray': len + ' ' + (100 - len),
        'stroke-dashoffset': -(cum + (p - len) / 2)
      }, g);
      cum += p;
    });
    var t1 = el('text', { x: 54, y: 48, 'text-anchor': 'middle', 'font-size': '9.5', fill: 'var(--muted)' }, svg);
    t1.textContent = '本期销售额';
    var t2 = el('text', { x: 54, y: 68, 'text-anchor': 'middle', 'font-size': '15', 'font-weight': '700', fill: 'var(--fg)' }, svg);
    t2.textContent = fmtInt(total) + '万';
  }

  function renderLegend(pcts, amts) {
    donutLegend.innerHTML = pcts.map(function (p, i) {
      return '<div class="legend-item">' +
        '<span class="legend-dot" style="background:' + CATS[i].color + '"></span>' +
        '<span class="legend-name">' + CATS[i].name + '</span>' +
        '<span class="legend-val num"><strong>' + p + '%</strong><small>' + fmtWan(amts[i]) + '万</small></span>' +
        '</div>';
    }).join('');
  }

  /* ---------------- 客户榜（TOP5 + 查看全部） ---------------- */
  var ICON_CHEV = '<svg class="od-icon rank-chev" style="--od-icon-size:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9.5 6.5 5.5 5.5-5.5 5.5"/></svg>';

  function renderRank(rank) {
    var rows = rankExpanded ? rank : rank.slice(0, 5);
    rankList.innerHTML = rows.map(function (r, i) {
      var c = CUSTOMERS[i];
      return '<button type="button" class="rank-row" data-i="' + i + '" aria-label="查看' + c.name + '详情">' +
        '<span class="rank-no r' + (i + 1) + ' num">' + (i + 1) + '</span>' +
        '<span class="rank-main"><span class="rank-name od-truncate">' + c.name + '</span>' +
        '<span class="rank-cat">' + c.cat + '</span></span>' +
        '<span class="rank-side"><span class="rank-amt num">' + fmtWan(r.amt) + ' 万</span>' +
        '<span class="rank-delta ' + (r.delta >= 0 ? 'up' : 'down') + ' num">' + (r.delta >= 0 ? '↑' : '↓') + ' ' + Math.abs(r.delta).toFixed(1) + '%</span></span>' +
        '<span class="rank-ord num" aria-label="订单量">' + fmtInt(r.orders) + ' 单</span>' +
        '<span class="rank-rate num" aria-label="目标完成率">' + r.rate + '%</span>' +
        ICON_CHEV +
        '</button>';
    }).join('');
    if (rank.length > 5) {
      rankMore.hidden = false;
      rankMore.textContent = rankExpanded ? '收起' : '查看全部 ' + rank.length + ' 家客户';
      rankMore.setAttribute('aria-expanded', rankExpanded ? 'true' : 'false');
    } else {
      rankMore.hidden = true;
    }
  }

  /* ---------------- 周期切换 ---------------- */
  function setPeriod(p) {
    period = p;
    rankExpanded = false;
    segPeriods.forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.p === p ? 'true' : 'false');
    });
    var d = DASH[p];
    tween('sales', kpiSales, d.sales, fmtWan);
    tween('orders', kpiOrders, d.orders, fmtInt);
    tween('rate', kpiRate, d.rate, function (v) { return v.toFixed(1); });
    setDelta(kpiSalesDelta, d.deltas[0]);
    setDelta(kpiOrdersDelta, d.deltas[1]);
    setDelta(kpiRateDelta, d.deltas[2]);
    trendSub.textContent = d.trendSub;
    drawTrend(trendSvg, d.trend, d.trendLabels);
    drawDonut(donutSvg, d.cats, d.sales);
    renderLegend(d.cats, d.catAmts);
    renderRank(d.rank);
  }

  /* ---------------- 进度条列表 ---------------- */
  function progItem(t, color) {
    var nameHtml = color
      ? '<span class="dot-mark" style="background:' + color + '"></span>' + t.name
      : t.name;
    return '<div class="prog-item">' +
      '<div class="prog-top"><span class="prog-name">' + nameHtml + '</span>' +
      '<span class="prog-pct num">' + t.pct.toFixed(1) + '%</span></div>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + t.pct + '%"></div></div>' +
      '<span class="prog-sub num">已完成 ' + fmtWan(t.done) + ' 万 / 目标 ' + fmtInt(t.target) + ' 万</span>' +
      '</div>';
  }

  /* ---------------- 迷你走势（客户详情） ---------------- */
  function drawSpark(svg, vals) {
    clearSvg(svg);
    var W = 335, H = 64, L = 6, R = 52, T = 8, B = 8;
    var n = vals.length;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || Math.abs(max) || 1;
    var lo = min - span * 0.2, hi = max + span * 0.2;
    function x(i) { return L + (W - L - R) * i / (n - 1); }
    function y(v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); }
    var pts = vals.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); });
    var line = 'M' + pts.join(' L');
    el('path', { d: line + ' L' + x(n - 1).toFixed(1) + ',' + (H - B) + ' L' + L + ',' + (H - B) + ' Z', fill: 'rgba(22,119,255,0.10)', stroke: 'none' }, svg);
    el('path', { d: line, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    el('circle', { cx: x(n - 1).toFixed(1), cy: y(vals[n - 1]).toFixed(1), r: 3.5, fill: 'var(--accent)' }, svg);
    var t = el('text', { x: W - R + 10, y: y(vals[n - 1]) + 4, 'font-size': '12', 'font-weight': '600', fill: 'var(--fg)' }, svg);
    t.textContent = fmtWan(vals[n - 1]);
  }

  /* ---------------- 弹层（移动端抽屉 / PC 对话框） ---------------- */
  function openSheet() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    sheet.classList.remove('closing');
    scrim.hidden = false;
    sheet.hidden = false;
    sheetClose.focus();
  }
  function closeSheet() {
    if (sheet.hidden) return;
    scrim.hidden = true;
    sheet.classList.add('closing');
    closeTimer = setTimeout(function () {
      sheet.hidden = true;
      sheet.classList.remove('closing');
      if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    }, reduced ? 0 : 200);
  }

  function openCustomer(i) {
    var d = DASH[period], r = d.rank[i], c = CUSTOMERS[i];
    var avg = Math.round(r.amt * 10000 / r.orders);
    sheetTitle.textContent = c.name;
    sheetChip.hidden = false;
    sheetChip.textContent = c.cat;
    sheetBody.innerHTML =
      '<p class="sheet-sec-label">近7日销售走势（万元）</p>' +
      '<svg class="chart-svg" id="sparkSvg" viewBox="0 0 335 64" role="img" aria-label="近7日销售走势迷你图"></svg>' +
      '<div class="sheet-stats">' +
      '<div class="hs"><span class="hs-label">本期销售额</span><span class="hs-value num">' + fmtWan(r.amt) + ' 万元</span></div>' +
      '<div class="hs"><span class="hs-label">订单量</span><span class="hs-value num">' + fmtInt(r.orders) + ' 单</span></div>' +
      '<div class="hs"><span class="hs-label">客单价</span><span class="hs-value num">¥' + avg.toLocaleString('zh-CN') + '</span></div>' +
      '<div class="hs"><span class="hs-label">目标完成率</span><span class="hs-value num">' + r.rate + '%</span></div>' +
      '</div>' +
      '<p class="sheet-note">演示数据，用于原型交互展示</p>';
    drawSpark($('#sparkSvg'), c.spark.map(function (f) { return f * r.amt; }));
    lastFocus = document.activeElement;
    if (!lastFocus || lastFocus === document.body) lastFocus = rankList;
    openSheet();
  }

  /* ---------------- Toast ---------------- */
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 1600);
  }

  /* ---------------- 页面导航（TabBar / 侧边栏） ---------------- */
  function salesOpen() { return salesSub.classList.contains('is-open'); }

  function setInert(value) {
    $$('.screen').forEach(function (s) { if ('inert' in s) s.inert = value; });
    var tb = $('.tabbar');
    if (tb && 'inert' in tb) tb.inert = value;
    var sidebar = $('.sidebar');
    if (sidebar && 'inert' in sidebar) sidebar.inert = value;
  }

  function openSales(p) {
    if (p && DASH[p]) setPeriod(p);
    salesSub.classList.add('is-open');
    salesSub.removeAttribute('aria-hidden');
    setInert(true);
    salesBack.focus();
  }

  function closeSales(focusBack) {
    if (!salesOpen()) return;
    salesSub.classList.remove('is-open');
    salesSub.setAttribute('aria-hidden', 'true');
    setInert(false);
    if (focusBack !== false) {
      var trigger = $('.hub-card[data-hub="sales"]');
      if (trigger) trigger.focus();
    }
  }

  function switchTab(key) {
    closeSales(false);
    Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== key; });
    tabButtons.forEach(function (t) {
      if (t.dataset.tab === key) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    var sc = $('.page-body', screens[key]);
    if (sc) sc.scrollTop = 0;
    var elScreen = screens[key];
    elScreen.classList.remove('enter');
    void elScreen.offsetWidth;
    elScreen.classList.add('enter');
    if (key === 'target' && !ringShown) {
      ringShown = true;
      setTimeout(showRing, 80);
    }
  }

  function showRing() {
    ringArc.setAttribute('stroke-dasharray', RATE + ' ' + (100 - RATE));
    tween('ring', ringPct, RATE, function (v) { return v.toFixed(1) + '%'; });
  }

  /* ---------------- 状态设计预览（原型专用） ---------------- */
  var ICON_BOX = '<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5z"/><path d="M4 7.5 12 11l8-3.5"/><path d="M12 11v9"/></svg>';
  var ICON_WARN = '<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 3.5 19h17z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none"/></svg>';
  var ICON_LOCK = '<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';

  var STATE_DEMOS = {
    loading:
      '<div class="state-block">' +
      '<div class="sk-group" aria-hidden="true"><span class="sk-line" style="width:38%"></span><span class="sk-line" style="width:86%"></span><span class="sk-line" style="width:72%"></span><span class="sk-line" style="width:60%"></span></div>' +
      '<p class="state-note">正在加载数据，通常不超过 1 秒</p>' +
      '</div>',
    empty:
      '<div class="state-block">' +
      '<span class="state-ico" aria-hidden="true">' + ICON_BOX + '</span>' +
      '<p class="state-title">暂无数据</p>' +
      '<p class="state-desc">当前筛选条件下没有可展示的数据，可调整时间范围后重试</p>' +
      '<span class="state-actions"><button type="button" class="btn btn-ghost" data-act="retry">重新筛选</button></span>' +
      '</div>',
    error:
      '<div class="state-block">' +
      '<span class="state-ico" aria-hidden="true">' + ICON_WARN + '</span>' +
      '<p class="state-title">请求失败</p>' +
      '<p class="state-desc">网络异常或服务暂不可用，请稍后重试</p>' +
      '<span class="state-actions"><button type="button" class="btn btn-primary" data-act="retry">重新加载</button></span>' +
      '</div>',
    noperm:
      '<div class="state-block">' +
      '<span class="state-ico" aria-hidden="true">' + ICON_LOCK + '</span>' +
      '<p class="state-title">无权限访问</p>' +
      '<p class="state-desc">如需查看该模块数据，请联系管理员申请数据权限</p>' +
      '<span class="state-actions"><button type="button" class="btn btn-primary" data-act="perm">申请权限</button></span>' +
      '</div>'
  };

  function setStateDemo(kind) {
    if (!STATE_DEMOS[kind]) return;
    stateDemo.innerHTML = STATE_DEMOS[kind];
    $$('.seg-btn[data-state]', stateSeg).forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.state === kind ? 'true' : 'false');
    });
  }

  /* ---------------- 免登启动页 ---------------- */
  function runSplash() {
    splash.classList.remove('out');
    splash.hidden = false;
    splashStatus.textContent = '正在通过企业微信验证身份…';
    setTimeout(function () {
      splash.classList.add('out');
      setTimeout(function () {
        splash.hidden = true;
      }, reduced ? 0 : 300);
    }, reduced ? 500 : 1500);
  }

  /* ---------------- 事件绑定 ---------------- */
  tabButtons.forEach(function (t) {
    t.addEventListener('click', function () { switchTab(t.dataset.tab); });
  });
  segPeriods.forEach(function (b) {
    b.addEventListener('click', function () { setPeriod(b.dataset.p); });
  });
  hubGrid.addEventListener('click', function (e) {
    var card = e.target.closest('.hub-card');
    if (!card) return;
    if (card.dataset.hub === 'sales') { openSales(); return; }
    if (card.dataset.state === 'locked') {
      showToast('「' + HUB_TITLES[card.dataset.hub] + '」暂无访问权限，请联系管理员开通');
    } else {
      showToast('「' + HUB_TITLES[card.dataset.hub] + '」建设中，当前演示开放销售数据');
    }
  });
  overviewStrip.addEventListener('click', function () { openSales('month'); });
  salesBack.addEventListener('click', function () { closeSales(); });
  rankList.addEventListener('click', function (e) {
    var btn = e.target.closest('.rank-row');
    if (btn) openCustomer(parseInt(btn.dataset.i, 10));
  });
  rankMore.addEventListener('click', function () {
    rankExpanded = !rankExpanded;
    renderRank(DASH[period].rank);
  });
  stateSeg.addEventListener('click', function (e) {
    var b = e.target.closest('.seg-btn[data-state]');
    if (b) setStateDemo(b.dataset.state);
  });
  stateDemo.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    showToast(b.dataset.act === 'perm' ? '已提交权限申请（演示交互）' : '已重新加载（演示交互）');
  });
  $('#helpBtn').addEventListener('click', function () { showToast('帮助与反馈（演示入口）'); });
  sheetClose.addEventListener('click', closeSheet);
  scrim.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!sheet.hidden) closeSheet();
      else if (salesOpen()) closeSales();
    }
  });

  var sbCollapse = $('#sbCollapse');
  var collapseText = $('.sb-collapse-text', sbCollapse);
  sbCollapse.addEventListener('click', function () {
    var collapsed = document.body.classList.toggle('sb-collapsed');
    sbCollapse.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    sbCollapse.setAttribute('aria-label', collapsed ? '展开侧边栏' : '折叠侧边栏');
    if (collapseText) collapseText.textContent = collapsed ? '展开导航' : '折叠导航';
  });

  var desktopQuery = window.matchMedia('(min-width: 1024px)');
  desktopQuery.addEventListener('change', function (event) {
    if (!event.matches) document.body.classList.remove('sb-collapsed');
  });

  /* 趋势图随窗口宽度自适应重绘 */
  if ('ResizeObserver' in window && trendCard) {
    var ro = new ResizeObserver(debounce(function () {
      drawTrend(trendSvg, DASH[period].trend, DASH[period].trendLabels);
    }, 140));
    ro.observe(trendCard);
  } else {
    window.addEventListener('resize', debounce(function () {
      drawTrend(trendSvg, DASH[period].trend, DASH[period].trendLabels);
    }, 140));
  }

  /* ---------------- 初始化 ---------------- */
  $('#teamList').innerHTML = TEAMS.map(function (t) { return progItem(t, null); }).join('');
  $('#catProgList').innerHTML = CAT_PROG.map(function (t) { return progItem(t, t.color); }).join('');
  setPeriod('today');
  setStateDemo('loading');
  runSplash();
})();
