import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import DashboardChart from '../components/DashboardChart.jsx';
import FloatingActionButton from '../components/FloatingActionButton.jsx';
import ProductForm from '../components/ProductForm.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { Package, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showProductForm, setShowProductForm] = useState(false);
  const { addProduct, products } = useProducts();

  // Calculate total stock from products context, ensuring stock is a number
  const totalStock = products.reduce((sum, product) => sum + (Number(product.stock_quantity) || 0), 0); // Use stock_quantity
  // Calculate low stock alerts, ensuring stock and min_stock are numbers
  const lowStockAlerts = products.filter(product => (Number(product.stock_quantity) || 0) < (Number(product.minimum_stock) || 0)).length; // Use stock_quantity and minimum_stock
  // Today's transactions will come from a separate API later, for now, keep as 0
  const todaysTransactions = 0;

  const handleFabClick = () => {
    setShowProductForm(true);
  };

  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData);
      setShowProductForm(false);
      toast.success('Product added successfully!'); // Use toast.success
    } catch (error) {
      toast.error('Failed to add product.'); // Use toast.error
    }
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Kelola persediaan produk Anda dengan mudah</p>
      
      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <Card title="Total Stock" value={totalStock} icon={Package} />
        <Card 
          title="Low Stock Alerts" 
          value={lowStockAlerts} 
          icon={AlertTriangle} 
          onClick={() => navigate('/stock-alerts')}
        />
        <Card 
          title="Today's Transactions" 
          value={todaysTransactions} 
          icon={ArrowRightLeft} 
          onClick={() => navigate('/history')}
        />
      </div>

      {/* Chart */}
      <div className="dashboard-chart-section">
        <DashboardChart />
      </div>

      {/* Quick Actions */}
      <FloatingActionButton onClick={handleFabClick} />

      {showProductForm && (
        <ProductForm onSubmit={handleAddProduct} onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default Dashboard;