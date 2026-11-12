export const pageNames = [
  'workbench',
  'sales',
  'goals',
  'profile',
  'customer',
];
export const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

export function selectors(name, reference) {
  if (name === 'customer') {
    return {
      dialog: reference ? '#sheet' : '.customer-dialog',
      title: '.sheet-title',
      stats: '.sheet-stats',
      sparkline: reference ? '#sparkSvg' : '.customer-dialog .echarts',
    };
  }
  const screen = reference
    ? {
      workbench: '#screen-dash',
      sales: '#salesSub',
      goals: '#screen-target',
      profile: '#screen-me',
    }[name]
    : '.screen';
  const extra = {
    workbench: { overview: '.overview-strip', modules: '.hub-grid', firstModule: '.hub-card' },
    sales: {
      periods: '.seg-sub',
      kpis: '.kpi-grid',
      trend: reference ? '#trendCard' : '.trend-card',
      trendPlot: reference ? '#trendSvg' : '.trend-card .echarts',
      category: reference ? '.sales-row .card' : '.category-card',
      ranking: reference ? '#salesSub .page-body > .card:last-child' : '.ranking-card',
    },
    goals: {
      hero: '.hero-card',
      ring: reference ? '.ring-svg' : '.progress-ring',
      teams: '.target-side .card:first-child',
      categories: '.target-side .card:last-child',
    },
    profile: {
      person: '.me-card',
      settings: '.set-list',
      avatar: reference ? '.avatar' : '.q-avatar__content',
      settingLabel: '.set-label',
      settingValue: '.set-value',
    },
  };
  return {
    header: `${screen} ${name === 'sales'
      ? '.sub-head'
      : '.screen-head'}`,
    title: `${screen} .page-title`,
    body: `${screen} .page-body`,
    ...extra[name],
  };
}

export function validatePair(reference, actual, tolerance = 1) {
  const failures = [];
  for (const [label, sample] of [
    ['reference', reference],
    ['actual', actual],
  ]) {
    for (const error of sample.errors)
      failures.push(`${label}: ${error}`);
    if (sample.scrollPositions?.some(position => position.x !== 0 || position.y !== 0))
      failures.push(`${label}: scroll position is not normalized`);
  }
  for (const [name, expected] of Object.entries(reference.rects)) {
    const observed = actual.rects[name];
    if (!expected || !observed || !expected.width || !expected.height || !observed.width || !observed.height) {
      failures.push(`${name}: missing or empty element`);
      continue;
    }
    for (const field of ['x', 'y', 'width', 'height']) {
      if (!Number.isFinite(observed[field]) || Math.abs(expected[field] - observed[field]) > tolerance)
        failures.push(`${name}.${field}: ${expected[field]} → ${observed[field]}`);
    }
    // SVG rings and ECharts canvases have distinct typography; compare text-bearing regions.
    if ([
      'title',
      'avatar',
      'settingLabel',
      'settingValue',
    ].includes(name)) {
      for (const field of [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'color',
      ]) {
        // QAvatar centers its glyph with flex; its internal line box differs, while pixels match.
        if (name === 'avatar' && field === 'lineHeight')
          continue;
        if (expected[field] !== observed[field])
          failures.push(`${name}.${field}: ${expected[field]} → ${observed[field]}`);
      }
    }
  }
  if ((reference.periodLabels?.length ?? 0) !== (actual.periodLabels?.length ?? 0))
    failures.push('periods: missing period button');
  for (const [index, label] of (reference.periodLabels ?? []).entries()) {
    if (label.text !== actual.periodLabels?.[index]?.text)
      failures.push(`periods: label changed (${label.text})`);
  }
  for (const label of actual.periodLabels ?? []) {
    if (label.dx > tolerance || label.dy > tolerance)
      failures.push(`period ${label.text}: not centered (${label.dx}, ${label.dy})`);
  }
  if (actual.overflow)
    failures.push('document: horizontal overflow');
  return failures;
}
