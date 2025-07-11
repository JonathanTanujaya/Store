import React, { useState } from 'react';
import TransactionTable from '../components/TransactionTable.jsx';
import { useTransactions } from '../context/TransactionContext.jsx';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx'; // Import ConfirmationDialog
import './History.css'; // Updated CSS import

const History = () => {
    const { clearAllTransactions } = useTransactions();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleClearHistory = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmClear = async () => {
        try {
            await clearAllTransactions();
            toast.success('Transaction history cleared successfully!');
        } catch (error) {
            toast.error('Failed to clear transaction history.');
            console.error('Error clearing history:', error);
        }
        setShowConfirmDialog(false);
    };

    const handleCancelClear = () => {
        setShowConfirmDialog(false);
    };

    return (
        <div className="history-page">
            <h1 className="history-title">Transaction History</h1>
            <p className="history-subtitle">Lihat semua riwayat transaksi masuk dan keluar</p>
            <button onClick={handleClearHistory} className="clear-history-button">
                Clear All History
            </button>
            <TransactionTable />

            <ConfirmationDialog
                isOpen={showConfirmDialog}
                message="Are you sure you want to clear all transaction history? This action cannot be undone."
                onConfirm={handleConfirmClear}
                onCancel={handleCancelClear}
            />
        </div>
    );
};

export default History;