import React from 'react';
import Sidebar from './Sidebar.jsx';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="layout-content-area">
                <main className="layout-main-content">
                    <div className="layout-inner-content">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;