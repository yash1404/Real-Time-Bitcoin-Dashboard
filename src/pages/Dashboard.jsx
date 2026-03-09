import { useEffect, useMemo, useState } from 'react';
import { subscribeToTicker, subscribeToConnectionStatus } from '../services/websocket.js';
import usePrevious from '../hooks/usePrevious.js';
import { formatNumber } from '../utils/formatNumber.js';
import StatCard from '../components/StatCard/StatCard.jsx';
import TradingViewChart from '../components/TradingViewChart/TradingViewChart.jsx';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function Dashboard() {
  const [ticker, setTicker] = useState(null);
  const previousPrice = usePrevious(ticker?.lastPrice);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = subscribeToTicker((nextTicker) => {
      // Merge new values into previous ticker so that missing/null fields
      // in the snapshot do not wipe out already-known values.
      setTicker((prev) => {
        if (!prev) return nextTicker;

        const merged = { ...prev };

        Object.entries(nextTicker || {}).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            merged[key] = value;
          }
        });

        return merged;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribeStatus = subscribeToConnectionStatus((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubscribeStatus();
    };
  }, []);

  const priceTrend = useMemo(() => {
    if (!ticker || previousPrice == null) return 'none';
    if (ticker.lastPrice > previousPrice) return 'up';
    if (ticker.lastPrice < previousPrice) return 'down';
    return 'none';
  }, [ticker, previousPrice]);

  const priceChange24h = useMemo(() => {
    if (!ticker || ticker.lastPrice == null || ticker.change24hPercent == null) {
      return null;
    }
    const diff = (ticker.lastPrice * ticker.change24hPercent) / 100;
    if (!diff) return null;
    return diff;
  }, [ticker]);

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Connected'
      : connectionStatus === 'connecting'
        ? 'Connecting...'
        : connectionStatus === 'error'
          ? 'Error - retrying'
          : 'Disconnected';

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-text">
          <h1 className="app-title">BTC/USDT Real-Time Dashboard</h1>
          <p className="app-subtitle">
            Live BTC ticker via Bybit WebSocket · Advanced chart by TradingView
          </p>
        </div>
        <div className="app-header-right">
          <div className="ws-status">
            <span
              className={`ws-status-dot ${
                connectionStatus === 'connected'
                  ? 'ws-status-dot--connected'
                  : connectionStatus === 'error'
                    ? 'ws-status-dot--error'
                    : ''
              }`}
            />
            <span>{statusLabel}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="app-main">
        <section className="stats-grid" aria-label="BTC ticker statistics">
          <StatCard
            title="BTC Price"
            value={
              ticker
                ? `$${formatNumber(ticker.lastPrice, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}`
                : '-'
            }
            subtitle={
              ticker ? (
                <>
                  <span>Last traded price</span>
                  {priceChange24h != null && (
                    <span
                      style={{
                        display: 'block',
                        marginTop: 2,
                        color:
                          priceChange24h > 0
                            ? 'var(--color-accent-positive)'
                            : 'var(--color-accent-negative)',
                      }}
                    >
                      {priceChange24h > 0 ? '+' : '-'}
                      {`$${formatNumber(Math.abs(priceChange24h), {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}`}
                    </span>
                  )}
                </>
              ) : (
                'Waiting for live data...'
              )
            }
            trend="none"
          />

          <StatCard
            title="Mark Price"
            value={
              ticker
                ? `$${formatNumber(ticker.markPrice, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}`
                : '-'
            }
            subtitle="Fair price used for margin calculations"
          />

          <StatCard
            title="24h High"
            value={
              ticker
                ? `$${formatNumber(ticker.high24h, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}`
                : '-'
            }
            subtitle="Highest traded price in the last 24 hours"
          />

          <StatCard
            title="24h Low"
            value={
              ticker
                ? `$${formatNumber(ticker.low24h, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}`
                : '-'
            }
            subtitle="Lowest traded price in the last 24 hours"
          />

          <StatCard
            title="24h Volume (Turnover)"
            value={
              ticker
                ? `$${formatNumber(ticker.volume24h, {
                    maximumFractionDigits: 0,
                  })}`
                : '-'
            }
            subtitle="Notional trading volume over the last 24 hours"
          />

          <StatCard
            title="24h Change"
            value={
              ticker
                ? formatNumber(ticker.change24hPercent, {
                    style: 'percent',
                    maximumFractionDigits: 2,
                  })
                : '-'
            }
            subtitle="Relative price change over the last 24 hours"
            trend={
              !ticker || ticker.change24hPercent === 0
                ? 'none'
                : ticker.change24hPercent > 0
                  ? 'up'
                  : 'down'
            }
          />
        </section>

        <section className="chart-section" aria-label="BTCUSDT chart">
          <div className="chart-header">
            <h2 className="chart-title">BTC/USDT Advanced Chart</h2>
            <span className="chart-theme-indicator">
              Chart theme: <strong>{theme === 'light' ? 'Light' : 'Dark'}</strong>
            </span>
          </div>
          <TradingViewChart theme={theme} />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

