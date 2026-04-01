function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getBrandBlurDataUrl(theme = 'dark') {
  if (theme === 'light') {
    return svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#fff8f0"/>
            <stop offset="55%" stop-color="#f1e2cb"/>
            <stop offset="100%" stop-color="#d7b57b"/>
          </linearGradient>
        </defs>
        <rect width="160" height="100" fill="url(#g)"/>
      </svg>
    `);
  }

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#090706"/>
          <stop offset="55%" stop-color="#241a12"/>
          <stop offset="100%" stop-color="#8f6b33"/>
        </linearGradient>
      </defs>
      <rect width="160" height="100" fill="url(#g)"/>
    </svg>
  `);
}
