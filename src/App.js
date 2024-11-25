import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Search,
  TrendingUp,
  Clock,
  Plus,
  AlertCircle,
  Loader2,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit,
  X,
  Star,
  BarChart2
} from 'lucide-react';
import debounce from 'lodash/debounce';

// Styled Components with dynamic props
const Card = ({ children, className, isLoading }) => (
  <div className={`
    bg-white rounded-lg shadow-md transition-all duration-200
    ${isLoading ? 'animate-pulse bg-gray-100' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const Button = ({ children, onClick, className, variant = 'primary', disabled, isLoading }) => {
  const baseStyle = 'px-4 py-2 rounded font-medium transition-all duration-200 flex items-center gap-2';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyle}
        ${variants[variant]}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

const Input = React.forwardRef(({ error, icon: Icon, ...props }, ref) => (
  <div className="relative">
    {Icon && (
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Icon size={18} />
      </div>
    )}
    <input
      ref={ref}
      {...props}
      className={`
        w-full p-2 pl-10 border rounded
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${error ? 'border-red-500 ring-red-200' : 'border-gray-200'}
        ${Icon ? 'pl-10' : 'pl-4'}
      `}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle />
            <h3 className="font-semibold">Something went wrong</h3>
          </div>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            <RefreshCcw size={16} />
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// API configuration
const API_URL = 'https://coingecko.p.rapidapi.com/coins/markets';
const API_OPTIONS = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '0026bcf8a1mshb924ad6fbaa031fp15ce2cjsn87ce6d3e6066',
    'X-RapidAPI-Host': 'coingecko.p.rapidapi.com'
  }
};

const LoadingCard = () => (
  <Card isLoading className="p-4 h-24" />
);

const EditHoldingModal = ({ holding, onSave, onClose }) => {
  const [editedHolding, setEditedHolding] = useState(holding);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedHolding);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="p-6 max-w-md w-full bg-white">
        <h3 className="text-xl font-bold mb-4">Edit Holding</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              step="0.000001"
              value={editedHolding.amount}
              onChange={(e) => setEditedHolding(prev => ({
                ...prev,
                amount: parseFloat(e.target.value)
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price</label>
            <Input
              type="number"
              step="0.01"
              value={editedHolding.price}
              onChange={(e) => setEditedHolding(prev => ({
                ...prev,
                price: parseFloat(e.target.value)
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Date</label>
            <Input
              type="date"
              value={editedHolding.date.split('T')[0]}
              onChange={(e) => setEditedHolding(prev => ({
                ...prev,
                date: new Date(e.target.value).toISOString()
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedHolding.notes}
              onChange={(e) => setEditedHolding(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const PriceChange = ({ value, className, small = false }) => {
  if (!value && value !== 0) return <span className="text-gray-400">N/A</span>;

  const isPositive = value > 0;
  const textSize = small ? 'text-xs' : 'text-sm';

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {isPositive ?
        <ChevronUp size={small ? 12 : 16} /> :
        <ChevronDown size={small ? 12 : 16} />
      }
      <span className={`${textSize} ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {Math.abs(value).toFixed(2)}%
      </span>
    </div>
  );
};

const AddToPortfolioModal = ({ crypto, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    amount: 1,
    price: crypto.current_price,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: `${crypto.id}-${Date.now()}`, // Unique ID for each purchase
      cryptoId: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      image: crypto.image,
      ...formData,
      date: new Date(formData.date).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="p-6 max-w-md w-full bg-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
            <h3 className="text-xl font-bold">{crypto.name} ({crypto.symbol.toUpperCase()})</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              step="0.000001"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                amount: parseFloat(e.target.value)
              }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price (USD)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                price: parseFloat(e.target.value)
              }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                date: e.target.value
              }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add to Portfolio
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const PortfolioFooter = ({ holdings, currentPrices }) => {
  const calculateGains = (timeframe) => {
    const total = holdings.reduce((acc, holding) => {
      const currentPrice = currentPrices[holding.cryptoId]?.current_price || holding.price;
      const currentValue = holding.amount * currentPrice;
      const purchaseValue = holding.amount * holding.price;

      let priceChangePercentage = 0;
      switch (timeframe) {
        case '24h':
          priceChangePercentage = currentPrices[holding.cryptoId]?.price_change_percentage_24h || 0;
          break;
        case '7d':
          priceChangePercentage = currentPrices[holding.cryptoId]?.price_change_percentage_7d || 0;
          break;
        // Add more timeframes as needed
      }

      return {
        value: acc.value + currentValue,
        cost: acc.cost + purchaseValue,
        change: acc.change + (currentValue * (priceChangePercentage / 100))
      };
    }, { value: 0, cost: 0, change: 0 });

    const gain = total.value - total.cost;
    const percentage = ((total.value - total.cost) / total.cost) * 100;
    const periodChange = timeframe === 'total' ? gain : total.change;
    const periodChangePercentage = timeframe === 'total' ? percentage : (total.change / total.value) * 100;

    return {
      value: periodChange,
      percentage: periodChangePercentage
    };
  };

  const timeframes = [
    { id: '24h', label: '24h' },
    { id: '7d', label: '7d' },
    { id: 'total', label: 'Total' }
  ];

  return (
    <div className="bg-white border-t shadow-lg p-4">
      <div className="grid grid-cols-3 gap-4">
        {timeframes.map(({ id, label }) => {
          const { value, percentage } = calculateGains(id);
          return (
            <div key={id} className="text-center">
              <div className="text-sm text-gray-500">{label}</div>
              <div className={`font-bold ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {value >= 0 ? '+' : ''}{value.toFixed(2)} USD
              </div>
              <div className={`text-sm ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {value >= 0 ? '+' : ''}{percentage.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EditPurchaseModal = ({ purchase, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    amount: purchase.amount,
    price: purchase.price,
    date: new Date(purchase.date).toISOString().split('T')[0],
    notes: purchase.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...purchase,
      ...formData,
      date: new Date(formData.date).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="p-6 max-w-md w-full bg-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Edit Purchase</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              step="0.000001"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                amount: parseFloat(e.target.value)
              }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price (USD)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                price: parseFloat(e.target.value)
              }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                date: e.target.value
              }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const PurchaseHistoryModal = ({ asset, onClose, onEditPurchase, onDeletePurchase }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sortedPurchases = useMemo(() => {
    return [...asset.purchases].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return sortConfig.direction === 'asc' ?
        aValue - bValue :
        bValue - aValue;
    });
  }, [asset.purchases, sortConfig]);

  const totalValue = asset.purchases.reduce((acc, purchase) =>
    acc + (purchase.amount * purchase.price), 0
  );

  const averagePrice = totalValue / asset.purchases.reduce((acc, purchase) =>
    acc + purchase.amount, 0
  );

  const DeleteConfirmModal = ({ purchase, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <Card className="p-6 max-w-md w-full bg-white">
        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
        <p className="mb-4">
          Are you sure you want to delete this transaction of {purchase.amount} {asset.symbol.toUpperCase()}?
        </p>
        <p className="mb-4 text-sm text-gray-500">
          Purchase Value: ${(purchase.amount * purchase.price).toFixed(2)}
          <br />
          Date: {new Date(purchase.date).toLocaleDateString()}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="p-6 max-w-4xl w-full bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <img src={asset.image} alt={asset.name} className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">{asset.name} Purchase History</h3>
              <p className="text-sm text-gray-500">
                Total Value: ${totalValue.toFixed(2)} | Average Price: ${averagePrice.toFixed(2)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left cursor-pointer" onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                  Date {sortConfig.key === 'date' && (
                    sortConfig.direction === 'desc' ? <ChevronDown size={16} className="inline" /> : <ChevronUp size={16} className="inline" />
                  )}
                </th>
                <th className="p-2 text-right cursor-pointer" onClick={() => setSortConfig({ key: 'amount', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                  Amount
                </th>
                <th className="p-2 text-right cursor-pointer" onClick={() => setSortConfig({ key: 'price', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                  Price
                </th>
                <th className="p-2 text-right">Value</th>
                <th className="p-2 text-left">Notes</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{new Date(purchase.date).toLocaleDateString()}</td>
                  <td className="p-2 text-right">{purchase.amount}</td>
                  <td className="p-2 text-right">${purchase.price.toFixed(2)}</td>
                  <td className="p-2 text-right">${(purchase.amount * purchase.price).toFixed(2)}</td>
                  <td className="p-2">{purchase.notes || '-'}</td>
                  <td className="p-2">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setEditingPurchase(purchase)}
                        className="p-1"
                        title="Edit purchase"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeleteConfirm(purchase)}
                        className="p-1"
                        title="Delete purchase"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editingPurchase && (
        <EditPurchaseModal
          purchase={editingPurchase}
          onSave={onEditPurchase}
          onClose={() => setEditingPurchase(null)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          purchase={deleteConfirm}
          onConfirm={() => {
            onDeletePurchase(deleteConfirm.id);
            setDeleteConfirm(null);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

const ErrorOverlay = ({ error, onRetry, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <Card className="p-6 max-w-md w-full bg-white animate-fade-in relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X size={20} />
      </button>
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Occurred</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={onRetry} className="px-6">
            <RefreshCcw size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </Card>
  </div>
);

const SearchInput = ({ value, onChange }) => {
  return (
    <div className="relative flex-grow">
      <Input
        placeholder="Search by name or symbol..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-8"
      />
      {value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => onChange('')}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// MarketStats with optimized data fetching
const useMarketData = () => {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/global/market_cap_chart?days=30&vs_currency=usd`,
        API_OPTIONS
      );
      if (!response.ok) throw new Error('Failed to fetch market data');
      const result = await response.json();

      // Store this data permanently as it doesn't need frequent updates
      setData(result);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }
  }, []);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);

  return data;
};

const TopSection = ({ cryptos, favorites, onCryptoClick, onRemoveFavorite }) => {
  const headerClassName = "px-2 py-1 border-b bg-gray-50 flex justify-between items-center text-xs font-semibold h-7";
  const cardClassName = "h-[140px] overflow-hidden";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
      {/* Top Gainers */}
      <Card className={cardClassName}>
        <div className={headerClassName}>
          <span>Top Gainers (24h)</span>
        </div>
        <div className="grid grid-cols-4 gap-px p-0.5 bg-gray-100 h-[calc(100%-28px)]">
          {cryptos
            .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
            .slice(0, 8)
            .map(crypto => crypto && (
              <div
                key={crypto.id}
                className="bg-white hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center p-1"
                onClick={() => onCryptoClick(crypto)}
              >
                <img 
                  src={crypto.image} 
                  alt={crypto.name} 
                  className="w-4 h-4 mb-0.5"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-coin.png';
                  }}
                />
                <span className="text-[9px] font-medium truncate w-full text-center">
                  {crypto.symbol?.toUpperCase()}
                </span>
                <span className="text-[9px] text-green-500 font-medium">
                  +{crypto.price_change_percentage_24h?.toFixed(1)}%
                </span>
              </div>
          ))}
        </div>
      </Card>

      {/* Total Market Cap */}
      <Card className={cardClassName}>
        <div className={headerClassName}>
          <span>Total Market Cap</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-0.5 hover:bg-gray-100 -mr-1"
            onClick={() => window.open('https://www.tradingview.com/chart/?symbol=TOTAL', '_blank')}
          >
            <BarChart2 size={12} />
          </Button>
        </div>
        <div className="flex flex-col p-2 h-[calc(100%-28px)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">
              ${((cryptos || []).reduce((sum, crypto) => sum + (crypto?.market_cap || 0), 0) / 1e9).toFixed(2)}B
            </span>
            <PriceChange
              value={cryptos[0]?.price_change_percentage_24h}
              className="text-xs"
              small
            />
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={generateChartData(cryptos, 30)} // Helper function to generate chart data
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="totalMarketGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#totalMarketGradient)"
                  strokeWidth={1.5}
                  dot={false}
                />
                <YAxis 
                  domain={['dataMin', 'dataMax']}
                  hide
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* USDT Market Cap */}
      <Card className={cardClassName}>
        <div className={headerClassName}>
          <span>USDT Market Cap</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-0.5 hover:bg-gray-100 -mr-1"
            onClick={() => window.open('https://www.tradingview.com/chart/?symbol=USDTUSD', '_blank')}
          >
            <BarChart2 size={12} />
          </Button>
        </div>
        <div className="flex flex-col p-2 h-[calc(100%-28px)]">
          {(() => {
            const tether = cryptos.find(c => c?.symbol?.toLowerCase() === 'usdt');
            return (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">
                    ${(tether?.market_cap / 1e9).toFixed(2)}B
                  </span>
                  <PriceChange
                    value={tether?.price_change_percentage_24h}
                    className="text-xs"
                    small
                  />
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={generateChartData([tether], 7)}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="tetherGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#tetherGradient)"
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <YAxis 
                        domain={['dataMin', 'dataMax']}
                        hide
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            );
          })()}
        </div>
      </Card>

      {/* Favorites */}
      <Card className={cardClassName}>
        <div className={headerClassName}>
          <span>Favorites</span>
        </div>
        <div className="h-[calc(100%-28px)] overflow-hidden">
          {!favorites?.length ? (
            <div className="p-2 text-xs text-gray-500 text-center">
              No favorites added
            </div>
          ) : (
            <div className="overflow-y-auto h-full divide-y divide-gray-100">
              {cryptos
                .filter(crypto => favorites.includes(crypto.id))
                .map(crypto => crypto && (
                  <div
                    key={crypto.id}
                    className="px-2 py-1 hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <img 
                      src={crypto.image} 
                      alt={crypto.name} 
                      className="w-4 h-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-coin.png';
                      }}
                    />
                    <span className="text-xs font-medium">{crypto.symbol?.toUpperCase()}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        ${crypto.current_price?.toLocaleString()}
                      </span>
                      <PriceChange
                        value={crypto.price_change_percentage_24h}
                        className="min-w-[50px] text-right"
                        small
                      />
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="p-0.5 hover:bg-gray-100"
                          onClick={() => onCryptoClick(crypto)}
                        >
                          <Search size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="p-0.5 hover:bg-gray-100"
                          onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${crypto.symbol?.toUpperCase()}USDT`, '_blank')}
                        >
                          <BarChart2 size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onRemoveFavorite(crypto.id)}
                          className="p-0.5 hover:bg-red-50"
                        >
                          <X size={12} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Helper function to safely generate chart data
const generateChartData = (cryptos, days) => {
  try {
    if (!Array.isArray(cryptos) || !cryptos.length) return [];
    
    // Use sparkline data if available
    if (cryptos[0]?.sparkline_in_7d?.price) {
      return cryptos[0].sparkline_in_7d.price.map((value, index) => ({
        time: index,
        value: Number(value) || 0
      }));
    }

    // Generate flat data if no sparkline
    const baseValue = cryptos[0]?.market_cap || 0;
    return Array.from({ length: days }, (_, i) => ({
      time: i,
      value: baseValue
    }));
  } catch (error) {
    console.error('Error generating chart data:', error);
    return [];
  }
};

const REFRESH_INTERVAL = 30000;
const ITEMS_PER_PAGE = 100;
const CACHE_DURATION = 60000;

const CryptoList = ({ onAddToPortfolio, onPricesUpdate }) => {
  // Core state
  const [cryptos, setCryptos] = useState([]);
  const [marketData, setMarketData] = useState({
    total: { marketCap: 0, change24h: 0, chartData30d: [] },
    tether: { marketCap: 0, change24h: 0, chartData7d: [] }
  });

  const BATCH_SIZE = 100; // Reduced batch size
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  // UI state
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showError, setShowError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [totalCryptos, setTotalCryptos] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageOptions = [20, 50, 100];
  const listRef = useRef(null);

  // Cached data refs
  const dataCache = useRef({
    timestamp: 0,
    data: []
  });

  const handleFetchError = useCallback((error) => {
    console.error('Fetch error:', error);
    if (cryptos.length === 0) {
      setError(error.message);
    } else {
      setRefreshError(`Refresh failed: ${error.message}. Using cached data.`);
      // Schedule retry if using cached data
      setTimeout(() => {
        fetchAllCryptos(true).catch(console.error);
      }, 10000);
    }
  }, [cryptos.length]);

  // Load favorites from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crypto-favorites')) || [];
    } catch {
      return [];
    }
  });

  const fetchCryptoBatch = async (page, retryCount = 0) => {
    try {
      const response = await fetch(
        `${API_URL}?vs_currency=usd&order=${sortConfig.key}_${sortConfig.direction}&per_page=${BATCH_SIZE}&page=${page}&sparkline=true&price_change_percentage=24h,7d`,
        API_OPTIONS
      );

      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)));
          return fetchCryptoBatch(page, retryCount + 1);
        }
        throw new Error('Rate limit exceeded');
      }

      if (!response.ok) throw new Error(`Failed to fetch page ${page}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      throw error;
    }
  };

  const fetchAllCryptos = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - dataCache.current.timestamp < CACHE_DURATION) {
      return dataCache.current.data;
    }

    setIsLoading(true);
    let allData = [];
    const batchPromises = [];

    try {
      // First batch to get initial data
      const firstBatch = await fetchCryptoBatch(1);
      allData = [...firstBatch];
      setCryptos(firstBatch); // Update UI immediately with first batch

      // If we got a full batch, fetch more
      if (firstBatch.length === BATCH_SIZE) {
        // Fetch remaining batches sequentially to avoid rate limits
        for (let page = 2; page <= 5; page++) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // Delay between requests
          try {
            const data = await fetchCryptoBatch(page);
            allData = [...allData, ...data];
            setCryptos(prev => {
              // Filter out duplicates based on id
              const uniqueData = [...prev, ...data].reduce((acc, current) => {
                if (!acc.find(item => item.id === current.id)) {
                  acc.push(current);
                }
                return acc;
              }, []);
              return uniqueData;
            });
          } catch (error) {
            console.error(`Failed to fetch page ${page}`, error);
            // Continue with what we have if later pages fail
            break;
          }
        }
      }

      if (allData.length > 0) {
        // Remove duplicates from final data
        const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());
        
        dataCache.current = {
          timestamp: now,
          data: uniqueData
        };

        // Update price map
        const pricesMap = uniqueData.reduce((acc, crypto) => {
          acc[crypto.id] = {
            current_price: crypto.current_price,
            price_change_percentage_24h: crypto.price_change_percentage_24h || 0,
            price_change_percentage_7d: crypto.price_change_percentage_7d || 0
          };
          return acc;
        }, {});
        onPricesUpdate(pricesMap);
      }

      return allData;
    } catch (error) {
      handleFetchError(error);
      return dataCache.current.data; // Return cached data on error
    } finally {
      setIsLoading(false);
    }
  }, [sortConfig, handleFetchError, onPricesUpdate]);

  // Pagination and filtering
  const paginatedCryptos = useMemo(() => {
    const filtered = cryptos.filter(crypto =>
      crypto.name.toLowerCase().includes(search.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(search.toLowerCase())
    );

    setTotalCryptos(filtered.length); // Update total count based on filters

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  }, [cryptos, search, page, itemsPerPage]);

  // Items per page options
  const itemsPerPageOptions = [20, 50, 100, 200];

  // Calculate market data from crypto list
  const calculateMarketData = useCallback((data) => {
    if (!data?.length) return null;

    const tether = data.find(crypto =>
      crypto.symbol.toLowerCase() === 'usdt' ||
      crypto.id === 'tether'
    );

    const totalMarketCap = data.reduce((sum, crypto) =>
      sum + (crypto.market_cap || 0), 0
    );

    const total24hChange = data.reduce((sum, crypto) => {
      const marketCapChange = (crypto.price_change_percentage_24h || 0) * (crypto.market_cap || 0) / 100;
      return sum + marketCapChange;
    }, 0) / totalMarketCap * 100;

    // Extract sparkline data for charts
    const chartData30d = data[0]?.sparkline_in_7d?.price || [];
    const tetherChartData = tether?.sparkline_in_7d?.price || [];

    return {
      total: {
        marketCap: totalMarketCap,
        change24h: total24hChange,
        chartData30d
      },
      tether: tether ? {
        marketCap: tether.market_cap,
        change24h: tether.price_change_percentage_24h,
        chartData7d: tetherChartData
      } : null
    };
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async (force = false) => {
    try {
      setIsLoading(true);
      const data = await fetchAllCryptos(force);

      // Update market data
      const marketInfo = calculateMarketData(data);
      setMarketData(marketInfo);

      // Update last fetch time
      setLastUpdate(new Date());
      setError(null);

      // Update price map for portfolio
      const pricesMap = data.reduce((acc, crypto) => {
        acc[crypto.id] = {
          current_price: crypto.current_price,
          price_change_percentage_24h: crypto.price_change_percentage_24h || 0,
          price_change_percentage_7d: crypto.price_change_percentage_7d || 0
        };
        return acc;
      }, {});
      onPricesUpdate(pricesMap);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllCryptos, calculateMarketData, onPricesUpdate]);

  // Initialize data and set up refresh interval
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('crypto-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Handlers
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  const toggleFavorite = useCallback((cryptoId) => {
    setFavorites(prev =>
      prev.includes(cryptoId)
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
  }, []);

  const scrollToCrypto = useCallback((crypto) => {
    const element = document.getElementById(`crypto-row-${crypto.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-blue-50');
      setTimeout(() => element.classList.remove('bg-blue-50'), 2000);
    }
  }, []);

  // Render helpers
  const formatNumber = useCallback((num, decimals = 2) => {
    if (!num) return '$0';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  }, []);

  const handleAddToPortfolio = useCallback((crypto) => {
    setSelectedCrypto({
      cryptoId: crypto.id,
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      current_price: crypto.current_price,
      image: crypto.image,
      price: crypto.current_price // Added for modal
    });
  }, []);

  return (
    <div className="w-full lg:w-2/3 p-4">
      {/* Top Section with fixed height containers */}
      <TopSection
        cryptos={cryptos}
        favorites={favorites}
        onCryptoClick={scrollToCrypto}
        onRemoveFavorite={toggleFavorite}
      />

      {/* Search and Controls */}
      <div className="mb-4 flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
        />

        <div className="ml-auto flex items-center gap-4">
          {lastUpdate && (
            <div className="text-sm text-right">
              <div className="text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              {error && (
                <div className="text-red-500 text-xs">
                  {error}
                </div>
              )}
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => fetchData(true)}
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw size={16} className="mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Crypto Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">Coin</th>
              <th
                className="py-2 px-4 text-right cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('current_price')}
              >
                <div className="flex items-center justify-end gap-1">
                  Price
                  {sortConfig.key === 'current_price' && (
                    sortConfig.direction === 'desc' ?
                      <ChevronDown size={14} /> :
                      <ChevronUp size={14} />
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 text-right cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('price_change_percentage_24h')}
              >
                <div className="flex items-center justify-end gap-1">
                  24h %
                  {sortConfig.key === 'price_change_percentage_24h' && (
                    sortConfig.direction === 'desc' ?
                      <ChevronDown size={14} /> :
                      <ChevronUp size={14} />
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 text-right cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('price_change_percentage_7d')}
              >
                <div className="flex items-center justify-end gap-1">
                  7d %
                  {sortConfig.key === 'price_change_percentage_7d' && (
                    sortConfig.direction === 'desc' ?
                      <ChevronDown size={14} /> :
                      <ChevronUp size={14} />
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 text-right cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('market_cap')}
              >
                <div className="flex items-center justify-end gap-1">
                  Market Cap
                  {sortConfig.key === 'market_cap' && (
                    sortConfig.direction === 'desc' ?
                      <ChevronDown size={14} /> :
                      <ChevronUp size={14} />
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 text-right cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('total_volume')}
              >
                <div className="flex items-center justify-end gap-1">
                  Volume (24h)
                  {sortConfig.key === 'total_volume' && (
                    sortConfig.direction === 'desc' ?
                      <ChevronDown size={14} /> :
                      <ChevronUp size={14} />
                  )}
                </div>
              </th>
              <th className="py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && cryptos.length === 0 ? (
              Array(ITEMS_PER_PAGE).fill(0).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td colSpan={8} className="py-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : (
              paginatedCryptos.map((crypto, index) => (
                <tr
                  id={`crypto-row-${crypto.id}`}
                  key={crypto.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(crypto.id)}
                      className="p-1 hover:bg-gray-100"
                    >
                      {favorites.includes(crypto.id) ? (
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      ) : (
                        <Star size={14} className="text-gray-400" />
                      )}
                    </Button>
                    <span className="ml-1">{(page - 1) * ITEMS_PER_PAGE + index + 1}</span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-coin.png';
                        }}
                      />
                      <div>
                        <div className="font-medium text-sm">{crypto.name}</div>
                        <div className="text-xs text-gray-500 uppercase">{crypto.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${crypto.current_price?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8
                    })}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex justify-end">
                      <PriceChange value={crypto.price_change_percentage_24h} />
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex justify-end">
                      <PriceChange value={Number(crypto.price_change_percentage_7d)} />
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    {formatNumber(crypto.market_cap)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {formatNumber(crypto.total_volume)}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToPortfolio(crypto)}
                        className="p-1"
                        title="Add to Portfolio"
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${crypto.symbol.toUpperCase()}USDT`, '_blank')}
                        className="p-1"
                        title="Open in TradingView"
                      >
                        <BarChart2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, totalCryptos)} of {totalCryptos}
          </div>
          <select
            className="p-2 border rounded"
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = Number(e.target.value);
              setItemsPerPage(newItemsPerPage);
              // Adjust current page to maintain approximate scroll position
              setPage(Math.floor(((page - 1) * itemsPerPage) / newItemsPerPage) + 1);
            }}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                Show {option} per page
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {generatePageNumbers(page, Math.ceil(totalCryptos / itemsPerPage)).map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2">...</span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'ghost'}
                  className={`w-8 h-8 p-0 ${pageNum === page ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(Math.ceil(totalCryptos / itemsPerPage), p + 1))}
            disabled={page >= Math.ceil(totalCryptos / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      {selectedCrypto && (
        <AddToPortfolioModal
          crypto={selectedCrypto}
          onSave={(purchase) => {
            onAddToPortfolio({
              ...purchase,
              cryptoId: selectedCrypto.cryptoId
            });
            setSelectedCrypto(null);
          }}
          onClose={() => setSelectedCrypto(null)}
        />
      )}
    </div>
  );
};

// Helper function to generate page numbers
const generatePageNumbers = (currentPage, totalPages) => {
  const pages = [];
  
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always show first page
  pages.push(1);

  if (currentPage > 3) {
    pages.push('...');
  }

  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
};

const Portfolio = ({ holdings, onRemoveHolding, onUpdateHolding, currentPrices }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleDeletePurchase = (purchaseId) => {
    onRemoveHolding(purchaseId);
  };

  const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' });

  // Group holdings by cryptoId and calculate statistics
  const portfolioData = useMemo(() => {
    const groupedHoldings = holdings.reduce((acc, holding) => {
      if (!acc[holding.cryptoId]) {
        acc[holding.cryptoId] = {
          id: holding.cryptoId,
          name: holding.name,
          symbol: holding.symbol,
          image: holding.image,
          purchases: [],
          totalAmount: 0,
          totalValue: 0,
          averagePrice: 0,
          currentPrice: currentPrices[holding.cryptoId]?.current_price || holding.price,
          priceChange24h: currentPrices[holding.cryptoId]?.price_change_percentage_24h || 0,
        };
      }
      acc[holding.cryptoId].purchases.push(holding);
      acc[holding.cryptoId].totalAmount += holding.amount;
      const purchaseValue = holding.amount * holding.price;
      acc[holding.cryptoId].totalValue += purchaseValue;
      return acc;
    }, {});

    // Calculate additional statistics
    Object.values(groupedHoldings).forEach(asset => {
      asset.averagePrice = asset.totalValue / asset.totalAmount;
      asset.currentValue = asset.totalAmount * asset.currentPrice;
      asset.pnl = asset.currentValue - asset.totalValue;
      asset.pnlPercentage = ((asset.currentValue - asset.totalValue) / asset.totalValue) * 100;
    });

    return Object.values(groupedHoldings);
  }, [holdings, currentPrices]);

  // Sort portfolio assets
  const sortedAssets = useMemo(() => {
    return [...portfolioData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      return sortConfig.direction === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [portfolioData, sortConfig]);

  // Calculate total portfolio statistics
  const portfolioStats = useMemo(() => {
    return portfolioData.reduce((stats, asset) => ({
      totalValue: stats.totalValue + asset.currentValue,
      totalCost: stats.totalCost + asset.totalValue,
      totalPnl: stats.totalPnl + asset.pnl,
    }), { totalValue: 0, totalCost: 0, totalPnl: 0 });
  }, [portfolioData]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="w-full lg:w-1/3 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={24} />
            Portfolio
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-sm text-gray-500">Total Value</h3>
              <p className="text-xl font-bold">${portfolioStats.totalValue.toFixed(2)}</p>
              <div className={`text-sm ${portfolioStats.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioStats.totalPnl >= 0 ? '+' : ''}${portfolioStats.totalPnl.toFixed(2)}
                ({((portfolioStats.totalPnl / portfolioStats.totalCost) * 100).toFixed(2)}%)
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-500">Assets</h3>
              <p className="text-xl font-bold">{portfolioData.length}</p>
              <p className="text-sm text-gray-500">Active Positions</p>
            </Card>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {sortedAssets.map(asset => (
            <Card
              key={asset.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      {asset.name}
                      <span className="text-sm font-normal text-gray-500">
                        {asset.symbol.toUpperCase()}
                      </span>
                    </h4>
                    <div className="text-sm text-gray-500">
                      {asset.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })} tokens
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedAsset(asset)}
                  className="text-sm"
                >
                  View History
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current Value:</span>
                  <span className="ml-2 font-medium">
                    ${asset.currentValue.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Avg. Price:</span>
                  <span className="ml-2 font-medium">
                    ${asset.averagePrice.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Current Price:</span>
                  <span className="ml-2 font-medium">
                    ${asset.currentPrice.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">24h Change:</span>
                  <span className={`ml-2 font-medium ${asset.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {asset.priceChange24h >= 0 ? '+' : ''}
                    {asset.priceChange24h.toFixed(2)}%
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Profit/Loss:</span>
                  <span className={`ml-2 font-medium ${asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {asset.pnl >= 0 ? '+' : ''}${asset.pnl.toFixed(2)}
                    ({asset.pnl >= 0 ? '+' : ''}{asset.pnlPercentage.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="p-4 border-t bg-white mt-4">
          <PortfolioFooter holdings={holdings} currentPrices={currentPrices} />
        </div>

        {selectedAsset && (
          <PurchaseHistoryModal
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onEditPurchase={onUpdateHolding}
            onDeletePurchase={handleDeletePurchase}
          />
        )}
      </div>
    </div>
  );
};

const CryptoTracker = () => {
  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem('crypto-portfolio');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPrices, setCurrentPrices] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    localStorage.setItem('crypto-portfolio', JSON.stringify(holdings));
  }, [holdings]);

  // Update last price check timestamp
  useEffect(() => {
    if (Object.keys(currentPrices).length > 0) {
      setLastUpdated(new Date());
    }
  }, [currentPrices]);

  const addToPortfolio = (purchase) => {
    const newPurchase = {
      ...purchase,
      id: `${purchase.cryptoId}-${Date.now()}`,
      timestamp: Date.now()
    };
    setHoldings(prev => [...prev, newPurchase]);
  };

  const updateHolding = (updatedPurchase) => {
    setHoldings(prev => prev.map(holding =>
      holding.id === updatedPurchase.id ? updatedPurchase : holding
    ));
  };

  const removeHolding = (id) => {
    setHoldings(prev => prev.filter(holding => holding.id !== id));
  };

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {lastUpdated && (
        <div className="absolute top-0 right-0 m-4 text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <ErrorBoundary>
        <Portfolio
          holdings={holdings}
          onRemoveHolding={removeHolding}
          onUpdateHolding={updateHolding}
          currentPrices={currentPrices}
        />
        <CryptoList
          onAddToPortfolio={addToPortfolio}
          onPricesUpdate={setCurrentPrices}
        />
      </ErrorBoundary>
    </div>
  );
};

export default CryptoTracker;
