# 🚀 Real-Time BTC/USDT Dashboard

A **real-time Bitcoin dashboard** built with **React + Vite** that streams live BTC/USDT market data using the **Bybit WebSocket API** and displays it alongside a **TradingView advanced chart**.

The dashboard updates automatically as new market data arrives and supports **light/dark theme switching**.

---

# ✨ Features

* 📡 Real-time BTC price updates using WebSocket
* 📊 Market statistics cards

  * BTC Price
  * Mark Price
  * 24h High
  * 24h Low
  * 24h Volume
  * 24h % Change
* 📈 TradingView Advanced Chart integration
* 🎨 Light / Dark mode toggle
* 🟢 Price increase indicator (green)
* 🔴 Price decrease indicator (red)
* 🔁 Automatic WebSocket reconnection

---

# 🛠 Tech Stack

* **React**
* **Vite**
* **JavaScript**
* **WebSocket API**
* **TradingView Widget**
* **CSS**

---

# 📂 Project Structure

```
src
│
├── components
│   ├── StatCard
│   ├── TradingViewChart
│   └── ThemeToggle
│
├── context
│   └── ThemeContext.jsx
│
├── hooks
│   └── usePrevious.js
│
├── services
│   └── websocket.js
│
├── pages
│   └── Dashboard.jsx
│
├── styles
│   ├── globals.css
│   └── themes.css
│
├── utils
│   └── formatNumber.js
│
├── App.jsx
└── main.jsx
```

# 🎨 Theme Support

The application supports **light and dark themes** using **React Context** and **CSS variables**.

* Theme is stored in **localStorage**
* UI updates instantly when switching themes
* TradingView chart theme updates as well

---

# ⚙️ Getting Started

### 1️⃣ Clone Repository

```
https://github.com/yash1404/Real-Time-Bitcoin-Dashboard.git
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Run development server

```
npm run dev
```

### 4️⃣ Build for production

```
npm run build
```

### 5️⃣ Preview production build

```
npm run preview
```

---

# 🖼 Dashboard Preview

### Dark Mode UI
<img width="1366" height="953" alt="BTC-DashBoard-DarkMode" src="https://github.com/user-attachments/assets/fbd47182-c33f-4441-8dd9-1f1d42583479" />

### Light Mode UI

<img width="1366" height="953" alt="BTC-DashBoard-LightMode" src="https://github.com/user-attachments/assets/c51ca8d9-a4b8-4160-96b2-81d6e850809c" />


# 📄 License

This project is built for a technical assignment.


