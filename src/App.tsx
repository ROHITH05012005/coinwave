import { useEffect, useState } from 'react'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import './App.css'

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

function App() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=true&price_change_percentage=24h')
        const data = await response.json()
        setCoins(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching coin data:", error)
        setLoading(false)
      }
    }

    fetchCoins()
    const interval = setInterval(fetchCoins, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="app-container"><div className="loading">Loading Market Data...</div></div>
  }

  return (
    <div className="app-container">
      <header className="header">
        <Activity size={40} className="logo-icon" />
        <h1 className="title">CoinWave</h1>
      </header>

      <div className="dashboard-grid">
        {coins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          const chartData = coin.sparkline_in_7d?.price.map((p, i) => ({ index: i, price: p })) || [];
          const minPrice = Math.min(...(coin.sparkline_in_7d?.price || [0]));
          const maxPrice = Math.max(...(coin.sparkline_in_7d?.price || [1]));

          return (
            <div key={coin.id} className="crypto-card">
              <div className="card-header">
                <div className="coin-info">
                  <img src={coin.image} alt={coin.name} className="coin-image" />
                  <div>
                    <h2 className="coin-name">{coin.name}</h2>
                    <p className="coin-symbol">{coin.symbol}</p>
                  </div>
                </div>
                <div className="price-container">
                  <h3 className="price">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</h3>
                  <div className={isPositive ? 'change-positive' : 'change-negative'}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <YAxis domain={[minPrice, maxPrice]} hide />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? "#00ff9d" : "#ff4757"} 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>
      <footer style={{ textAlign: "center", padding: "2rem", color: "#a0aec0", fontSize: "0.875rem" }}>
        Built by <a href="https://www.fuera.in.net/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}><strong>FUERA</strong></a>
      </footer>
    </div>
  )
}

export default App
