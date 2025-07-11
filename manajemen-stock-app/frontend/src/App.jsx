import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UIScaleProvider } from './context/UIScaleContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import History from './pages/History.jsx'; // Changed from Transactions
import Reports from './pages/Reports.jsx';
import StockAlerts from './pages/StockAlerts.jsx';
import AddTransaction from './pages/AddTransaction.jsx';
import Restock from './pages/Restock.jsx';

function App() {
  return (
    <Router>
      <UIScaleProvider>
        <Layout>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/products' element={<Products />} />
            <Route path='/history' element={<History />} /> {/* Changed route path and element */}
            <Route path='/reports' element={<Reports />} />
            <Route path='/stock-alerts' element={<StockAlerts />} />
            <Route path='/add-transaction' element={<AddTransaction />} />
            <Route path='/restock' element={<Restock />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" reverseOrder={false} />
      </UIScaleProvider>
    </Router>
  );
}

export default App;