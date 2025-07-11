import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, Package, ShoppingCart, BarChart2, Bell, PlusCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useUIScale } from '../context/UIScaleContext';
import './Sidebar.css';

const Sidebar = () => {
    const { lowStockCount } = useProducts();
    const { scaleFactor, setScaleFactor } = useUIScale();

    const sidebarRef = useRef(null);
    const [sidebarWidth, setSidebarWidth] = useState(256); // Initial width from CSS
    const [isResizing, setIsResizing] = useState(false);

    const handleZoomIn = () => {
        setScaleFactor(prev => Math.min(prev + 0.1, 1.5)); // Max zoom 150%
    };

    const handleZoomOut = () => {
        setScaleFactor(prev => Math.max(prev - 0.1, 0.8)); // Min zoom 80%
    };

    const startResizing = (e) => {
        setIsResizing(true);
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const resize = (e) => {
        if (isResizing) {
            const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
            // Limit min and max width
            if (newWidth > 150 && newWidth < 400) { // Example limits
                setSidebarWidth(newWidth);
            }
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResizing);
        return () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing]);

    return (
        <div 
            ref={sidebarRef} 
            className="sidebar-container"
            style={{ width: sidebarWidth }}
        >
            <div className="sidebar-header">
                <div className="app-title-container">
                    <h1>Manajemen Stock</h1>
                </div>
            </div>
            <nav className="sidebar-nav">
                <Link to="/" className="sidebar-nav-item">
                    <Home className="sidebar-icon" />
                    <span>Dashboard</span>
                </Link>
                <Link to="/products" className="sidebar-nav-item">
                    <Package className="sidebar-icon" />
                    <span>Products</span>
                </Link>
                <Link to="/history" className="sidebar-nav-item"> {/* Changed to /history */}
                    <ShoppingCart className="sidebar-icon" />
                    <span>History</span> {/* Changed text to History */}
                </Link>
                <Link to="/add-transaction" className="sidebar-nav-item">
                    <PlusCircle className="sidebar-icon" />
                    <span>Add Transaction</span>
                </Link>
                <Link to="/restock" className="sidebar-nav-item">
                    <PlusCircle className="sidebar-icon" />
                    <span>Restock</span>
                </Link>
                <Link to="/reports" className="sidebar-nav-item">
                    <BarChart2 className="sidebar-icon" />
                    <span>Reports</span>
                </Link>
                <Link to="/stock-alerts" className="sidebar-nav-item">
                    <Bell className="sidebar-icon" />
                    <span>Stock Alerts {lowStockCount > 0 && <span className="notification-dot"></span>}</span>
                </Link>
                <div className="sidebar-zoom-controls">
                    <button onClick={handleZoomOut} className="zoom-button">-</button>
                    <span className="zoom-level">{(scaleFactor * 100).toFixed(0)}%</span>
                    <button onClick={handleZoomIn} className="zoom-button">+</button>
                </div>
            </nav>
            <div 
                className="sidebar-resizer"
                onMouseDown={startResizing}
            />
        </div>
    );
};

export default Sidebar;