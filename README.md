# 🚀 Crypto Portfolio Tracker

A modern, responsive cryptocurrency portfolio tracker built with React. This application allows users to track their cryptocurrency holdings, monitor real-time market data, and manage their portfolio with an intuitive interface.

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.15-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)

## ⚠️ Important Disclaimers

> **Financial Disclaimer**: This application is for educational and portfolio tracking purposes only. It does not provide financial advice, investment recommendations, or trading signals. Cryptocurrency investments are highly volatile and risky. Always conduct your own research and consult with qualified financial advisors before making investment decisions.

> **Data Accuracy**: While we strive to provide accurate real-time data through the CoinGecko API, market data may be delayed or contain inaccuracies. Do not rely solely on this application for critical financial decisions.

> **Security Notice**: This application stores portfolio data in your browser's local storage. For enhanced security, avoid using this application on shared or public computers. Consider using hardware wallets and secure exchanges for actual cryptocurrency storage.

> **No Warranty**: This software is provided "as is" without warranty of any kind. The developers are not responsible for any losses, damages, or issues arising from the use of this application.

## ✨ Features

- **📊 Real-Time Market Data**: Live cryptocurrency prices, market cap, and 24h/7d price changes via CoinGecko API
- **💼 Portfolio Management**: Add, edit, and delete holdings with purchase details and notes
- **📈 Interactive Charts**: Market cap trends and portfolio performance visualization using Recharts
- **⭐ Favorites System**: Quick access to preferred cryptocurrencies with drag-and-drop reordering
- **💰 Portfolio Insights**: Total value, 24h changes, profit/loss tracking, and performance analytics
- **📱 Responsive Design**: Optimized for desktop and mobile with modern Tailwind CSS styling
- **🛡️ Error Handling**: Robust error boundaries and loading states for smooth UX
- **💾 Local Storage**: Browser-based data persistence (no server required)
- **🔍 Search & Filter**: Find cryptocurrencies by name or symbol with advanced sorting
- **📄 Pagination**: Browse large datasets efficiently

> **Note**: You can run the project locally to explore all features. See the [Installation](#installation) section below.

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## 🚀 Installation

### Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **CoinGecko API Key** - [Get from RapidAPI](https://rapidapi.com/coingecko/api/coingecko) or [CoinGecko Pro](https://www.coingecko.com/en/api)

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/crypto-portfolio-tracker.git
   cd crypto-portfolio-tracker
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using yarn
   yarn install
   ```

3. **Set Up Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_COINGECKO_API_KEY=your-api-key-here
   ```
   
   > **Security Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

4. **Run the Development Server**
   ```bash
   # Using npm
   npm start
   
   # Or using yarn
   yarn start
   ```
   
   The app will be available at `http://localhost:3000`

5. **Build for Production**
   ```bash
   # Using npm
   npm run build
   
   # Or using yarn
   yarn build
   ```

## 📖 Usage

### Getting Started

1. **Browse Cryptocurrencies**: View real-time market data with price, market cap, and percentage changes
2. **Add to Portfolio**: Click the "+" button to add cryptocurrencies to your portfolio
3. **Enter Details**: Specify amount, purchase price, date, and optional notes
4. **Track Performance**: Monitor your total portfolio value, profit/loss, and individual holdings
5. **Manage Favorites**: Star cryptocurrencies for quick access and reorder via drag-and-drop
6. **Analyze Trends**: View market cap charts and identify top performers

### Key Features Guide

- **Portfolio Dashboard**: Central hub showing total value, 24h changes, and performance metrics
- **Market Overview**: Top section displays market trends, BTC dominance, and total market cap
- **Search & Sort**: Use the search bar and sorting options to find specific cryptocurrencies
- **Historical Tracking**: View purchase history and calculate profit/loss for each holding
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

## 🛠️ Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | Frontend framework |
| **Tailwind CSS** | 3.4.15 | Utility-first styling |
| **Recharts** | 2.13.3 | Data visualization |
| **react-beautiful-dnd** | 13.1.1 | Drag-and-drop functionality |
| **Lucide React** | 0.460.0 | Icon library |
| **Lodash** | 4.17.21 | Utility functions |
| **CoinGecko API** | - | Real-time crypto data |

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# CoinGecko API Configuration
REACT_APP_COINGECKO_API_KEY=your-api-key-here

# Optional: API Rate Limiting
REACT_APP_API_RATE_LIMIT=100
```

### Obtaining API Keys

1. **CoinGecko Pro API**: Visit [CoinGecko Pro](https://www.coingecko.com/en/api) for official API access
2. **RapidAPI**: Alternative access via [RapidAPI CoinGecko](https://rapidapi.com/coingecko/api/coingecko)

> **Important**: Keep your API keys secure and never commit them to version control.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style and conventions
- Add tests for new features when applicable
- Update documentation for significant changes
- Ensure your code passes all existing tests
- Write clear, descriptive commit messages

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- **[CoinGecko](https://www.coingecko.com/)** - Cryptocurrency data API
- **[RapidAPI](https://rapidapi.com/)** - API hosting platform
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Recharts](https://recharts.org/)** - React charting library
- **[Lucide](https://lucide.dev/)** - Beautiful icon library
- **[React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)** - Drag and drop functionality
- **[Create React App](https://create-react-app.dev/)** - Project bootstrapping

## 🔄 Roadmap

- [ ] Multi-language support
- [ ] Advanced charting features
- [ ] Portfolio export functionality
- [ ] Price alerts and notifications
- [ ] Dark/light theme toggle
- [ ] Integration with popular exchanges
- [ ] Historical portfolio performance analytics

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

*Built with ❤️ by [CeponisM](https://github.com/your-username)*

</div>

---

> **Final Reminder**: This tool is for educational purposes only. Cryptocurrency investments carry significant risks. Always do your own research and invest responsibly.