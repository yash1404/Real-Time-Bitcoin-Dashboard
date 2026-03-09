const WS_URL = 'wss://stream.bybit.com/v5/public/linear';
const TOPIC = 'tickers.BTCUSDT';

let socket = null;
let reconnectTimeoutId = null;
let isManuallyClosed = false;
const subscribers = new Set();
const statusSubscribers = new Set();
let connectionStatus = 'disconnected'; // 'connecting' | 'connected' | 'disconnected' | 'error'

function parseTickerMessage(rawMessage) {
  try {
    const data = JSON.parse(rawMessage.data);

    // Ensure this is the ticker stream we care about
    if (data.topic !== TOPIC || !data.data) {
      return null;
    }

    // Linear ticker can be an object (per docs). Some SDKs wrap it in an array,
    // so we are supporting both shapes here.
    const ticker = Array.isArray(data.data) ? data.data[0] : data.data;
    if (!ticker) return null;

    const lastPrice = parseFloat(ticker.lastPrice);
    const markPrice = parseFloat(ticker.markPrice);
    const high24h = parseFloat(ticker.highPrice24h);
    const low24h = parseFloat(ticker.lowPrice24h);
    const volume24h = parseFloat(ticker.turnover24h || ticker.volume24h);
    const change24hPercent =
      ticker.price24hPcnt != null ? parseFloat(ticker.price24hPcnt) * 100 : null;

    return {
      symbol: ticker.symbol,
      lastPrice: Number.isNaN(lastPrice) ? null : lastPrice,
      markPrice: Number.isNaN(markPrice) ? null : markPrice,
      high24h: Number.isNaN(high24h) ? null : high24h,
      low24h: Number.isNaN(low24h) ? null : low24h,
      volume24h: Number.isNaN(volume24h) ? null : volume24h,
      change24hPercent:
        change24hPercent != null && !Number.isNaN(change24hPercent)
          ? change24hPercent
          : null,
      timestamp: Number(data.ts) || Date.now(),
    };
  } catch (error) {
    console.error('Failed to parse ticker message', error);
    return null;
  }
}

function notifySubscribers(ticker) {
  subscribers.forEach((callback) => {
    try {
      callback(ticker);
    } catch (error) {
      console.error('Subscriber error', error);
    }
  });
}

function notifyStatusSubscribers() {
  statusSubscribers.forEach((callback) => {
    try {
      callback(connectionStatus);
    } catch (error) {
      console.error('Status subscriber error', error);
    }
  });
}

function sendSubscription() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const payload = {
    op: 'subscribe',
    args: [TOPIC],
  };

  socket.send(JSON.stringify(payload));
}

function cleanupSocket() {
  if (socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
  }
}

function scheduleReconnect() {
  if (isManuallyClosed) return;
  if (reconnectTimeoutId) return;

  reconnectTimeoutId = setTimeout(() => {
    reconnectTimeoutId = null;
    console.info('Reconnecting WebSocket...');
    connectionStatus = 'connecting';
    notifyStatusSubscribers();
    connect();
  }, 3000);
}

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  isManuallyClosed = false;
  connectionStatus = 'connecting';
  notifyStatusSubscribers();

  try {
    socket = new WebSocket(WS_URL);
  } catch (error) {
    console.error('WebSocket connection failed', error);
    connectionStatus = 'error';
    notifyStatusSubscribers();
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    console.info('WebSocket connected');
    connectionStatus = 'connected';
    notifyStatusSubscribers();
    sendSubscription();
  };

  socket.onmessage = (event) => {
    const ticker = parseTickerMessage(event);
    if (ticker) {
      notifySubscribers(ticker);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error', error);
    connectionStatus = 'error';
    notifyStatusSubscribers();
  };

  socket.onclose = () => {
    console.warn('WebSocket closed');
    cleanupSocket();
    socket = null;
    if (!isManuallyClosed) {
      connectionStatus = 'disconnected';
      notifyStatusSubscribers();
    }
    if (!isManuallyClosed) {
      scheduleReconnect();
    }
  };
}

export function subscribeToTicker(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  subscribers.add(callback);

  if (!socket || socket.readyState === WebSocket.CLOSED) {
    connect();
  } else if (socket.readyState === WebSocket.OPEN) {
    sendSubscription();
  }

  return () => {
    subscribers.delete(callback);

    if (subscribers.size === 0 && socket) {
      isManuallyClosed = true;
      cleanupSocket();
      socket.close();
      socket = null;
      connectionStatus = 'disconnected';
      notifyStatusSubscribers();
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }
    }
  };
}

export function subscribeToConnectionStatus(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  statusSubscribers.add(callback);
  // Immediately inform subscriber of current status
  callback(connectionStatus);

  return () => {
    statusSubscribers.delete(callback);
  };
}

