import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useProducts } from '../context/ProductContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader, Package, Plus, Minus, Truck, ClipboardList, Search, CheckCircle } from 'lucide-react'; // Import icons
import './RestockForm.css'; // Create this CSS file if needed

const restockSchema = yup.object().shape({
  productId: yup.string().required('Product is required'),
  quantity: yup.number().typeError('Quantity must be a number').positive('Quantity must be positive').required('Quantity is required'),
  supplier: yup.string().optional(),
});

const RestockForm = () => {
  const { products, fetchProducts } = useProducts();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(restockSchema),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setValue('productId', product.id);
    setSearchTerm(product.name);
    setFilteredProducts([]);
  };

  const onSubmit = async (data) => {
    try {
      const transactionData = {
        transaction_type: 'IN',
        customer_name: null, // No customer for restock
        items: [
          {
            product_id: selectedProduct.id,
            quantity: data.quantity,
          },
        ],
        supplier_name: data.supplier || null,
      };
      
      const response = await axios.post('http://localhost:5000/api/transactions', transactionData);
      console.log('Restock successful:', response.data);
      toast.success('Product restocked successfully!');
      reset();
      setSelectedProduct(null);
      setSearchTerm('');
      fetchProducts(); // Refresh product list to show updated stock
    } catch (error) {
      console.error('Error submitting restock:', error.response ? error.response.data : error.message);
      toast.error(`Failed to restock product: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  return (
    <div className="restock-form-container">
      <form onSubmit={handleSubmit(onSubmit)} className="restock-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="product-search">Product <span className="required-indicator">*</span></label>
            <div className="input-with-icon">
              <Search className="input-icon" />
              <input
                id="product-search"
                type="text"
                className={`form-input ${errors.productId ? 'input-error' : ''}`}
                placeholder="Search for a product to restock..."
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
            <label htmlFor="quantity">Quantity to Restock <span className="required-indicator">*</span></label>
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
          <label htmlFor="supplier">Supplier (Optional)</label>
          <div className="input-with-icon">
            <Truck className="input-icon" />
            <input
              id="supplier"
              type="text"
              {...register('supplier')}
              className={`form-input ${errors.supplier ? 'input-error' : ''}`}
              placeholder="e.g., PT. Maju Mundur"
            />
          </div>
          {errors.supplier && <p className="error-message">{errors.supplier.message}</p>}
        </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? <Loader className="spinner" size={20} /> : <><CheckCircle size={20} /> Restock Product</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestockForm;