import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useProducts } from '../context/ProductContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Package, User, Calendar, DollarSign, CheckCircle, XCircle, Loader, Minus, Plus } from 'lucide-react'; // Import icons
import './AddTransaction.css';

const transactionSchema = yup.object().shape({
  productId: yup.string().required('Product is required'),
  quantity: yup.number().typeError('Quantity must be a number').positive('Quantity must be positive').required('Quantity is required'),
  customerName: yup.string().required('Customer Name is required'),
});

const AddTransaction = () => {
  const { products, fetchProducts } = useProducts();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(transactionSchema),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const quantity = watch('quantity', 0);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (selectedProduct && quantity > 0) {
      setTotalPrice(selectedProduct.selling_price * quantity);
    } else {
      setTotalPrice(0);
    }
  }, [selectedProduct, quantity]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setValue('productId', product.id);
    setSearchTerm(product.name);
    setFilteredProducts([]);
  };

  const onSubmit = async (data) => {
    try {
      const transactionData = {
        transaction_type: 'OUT', // Hardcode to OUT
        customer_name: data.customerName || null,
        items: [
          {
            product_id: selectedProduct.id,
            quantity: data.quantity,
          },
        ],
        total_amount: totalPrice, // Include total price
      };
      
      const response = await axios.post('http://localhost:5000/api/transactions', transactionData);
      console.log('Transaction successful:', response.data);
      toast.success('Transaction submitted successfully!');
      reset();
      setSelectedProduct(null);
      setSearchTerm('');
      setTotalPrice(0);
      fetchProducts();
    } catch (error) {
      console.error('Error submitting transaction:', error.response ? error.response.data : error.message);
      toast.error(`Failed to submit transaction: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  return (
    <div className="add-transaction-page">
      <h1 className="add-transaction-title">Add New Transaction</h1>
      <p className="add-transaction-subtitle">Record your product sales efficiently</p>
      <form onSubmit={handleSubmit(onSubmit)} className="transaction-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="product-search">Product <span className="required-indicator">*</span></label>
            <div className="input-with-icon">
              <Search className="input-icon" />
              <input
                id="product-search"
                type="text"
                className={`form-input ${errors.productId ? 'input-error' : ''}`}
                placeholder="Search for a product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filteredProducts.length > 0 && searchTerm && (
              <ul className="product-search-results">
                {filteredProducts.map(product => (
                  <li key={product.id} onClick={() => handleProductSelect(product)}>
                    {product.name} (Stock: {product.stock_quantity})
                  </li>
                ))}
              </ul>
            )}
            {selectedProduct && <p className="selected-product-info">Selected: {selectedProduct.name} (Current Stock: {selectedProduct.stock_quantity})</p>}
            <input type="hidden" {...register('productId')} />
            {errors.productId && <p className="error-message">{errors.productId.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity <span className="required-indicator">*</span></label>
            <div className="quantity-input-group">
              <button type="button" onClick={() => setValue('quantity', Math.max(0, quantity - 1))} className="quantity-button"><Minus size={16} /></button>
              <input
                id="quantity"
                type="number"
                {...register('quantity')}
                className={`form-input quantity-input ${errors.quantity ? 'input-error' : ''}`}
                placeholder="Enter quantity"
              />
              <button type="button" onClick={() => setValue('quantity', quantity + 1)} className="quantity-button"><Plus size={16} /></button>
            </div>
            {errors.quantity && <p className="error-message">{errors.quantity.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="customerName">Customer Name <span className="required-indicator">*</span></label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input
                id="customerName"
                type="text"
                {...register('customerName')}
                className={`form-input ${errors.customerName ? 'input-error' : ''}`}
                placeholder="Enter customer name"
              />
            </div>
            {errors.customerName && <p className="error-message">{errors.customerName.message}</p>}
          </div>

          <div className="form-group total-price-display">
            <label>Total Price</label>
            <div className="input-with-icon">
              <DollarSign className="input-icon" />
              <span className="total-price-value">$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? <Loader className="spinner" size={20} /> : <><CheckCircle size={20} /> Submit Transaction</>}
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;