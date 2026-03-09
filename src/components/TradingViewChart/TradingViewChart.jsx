import { useEffect, useRef } from 'react';

function TradingViewChart({ theme }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const scriptId = 'tradingview-widget-script';

    function createWidget() {
      if (!window.TradingView || !containerRef.current) return;

      containerRef.current.innerHTML = '';

      new window.TradingView.widget({
        autosize: true,
        symbol: 'BYBIT:BTCUSDT',
        interval: '60',
        timezone: 'Etc/UTC',
        theme: theme === 'light' ? 'light' : 'dark',
        style: '1',
        locale: 'en',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        container_id: 'tradingview_btcusdt',
      });
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.onload = createWidget;
      document.head.appendChild(script);
    } else {
      createWidget();
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className="tv-chart-wrapper">
      <div
        id="tradingview_btcusdt"
        ref={containerRef}
        className="tv-chart-container"
      />
    </div>
  );
}

export default TradingViewChart;

