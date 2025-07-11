
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Package, DollarSign, ClipboardList, Minus, Plus, Loader, CheckCircle, XCircle } from 'lucide-react'; // Import icons
import './ProductForm.css';

const schema = yup.object().shape({
  name: yup.string().required('Product Name is required'),
  purchase_price: yup.number().typeError('Must be a number').positive('Must be positive').required('Purchase Price is required'),
  selling_price: yup.number().typeError('Must be a number').positive('Must be positive').required('Selling Price is required'),
  stock: yup.number().typeError('Must be a number').integer('Must be an integer').min(0, 'Cannot be negative').required('Stock is required'),
  min_stock: yup.number().typeError('Must be a number').integer('Must be an integer').min(0, 'Cannot be negative').required('Minimum Stock is required'),
  category: yup.string().required('Category is required'),
});

const ProductForm = ({ product, onSubmit, onClose }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const stockQuantity = watch('stock', 0);
  const minStockQuantity = watch('min_stock', 0);

  useEffect(() => {
    if (product) {
      reset(product);
    } else {
      reset();
    }
  }, [product, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="product-form-overlay">
      <div className="product-form-container">
        <h2 className="product-form-title">{product ? 'Edit Product' : 'Add New Product'}</h2>
        <p className="product-form-subtitle">{product ? 'Update product details' : 'Add a new product to your inventory'}</p>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name <span className="required-indicator">*</span></label>
            <div className="input-with-icon">
              <Package className="input-icon" />
              <input id="name" type="text" {...register('name')} className={`form-input ${errors.name ? 'input-error' : ''}`} placeholder="Enter product name" />
            </div>
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="purchase_price">Purchase Price <span className="required-indicator">*</span></label>
            <div className="input-with-icon">
              <DollarSign className="input-icon" />
              <input id="purchase_price" type="number" step="0.01" {...register('purchase_price')} className={`form-input ${errors.purchase_price ? 'input-error' : ''}`} placeholder="Enter purchase price" />
            </div>
            {errors.purchase_price && <p className="error-message">{errors.purchase_price.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="selling_price">Selling Price <span className="required-indicator">*</span></label>
            <div className="input-with-icon">
              <DollarSign className="input-icon" />
              <input id="selling_price" type="number" step="0.01" {...register('selling_price')} className={`form-input ${errors.selling_price ? 'input-error' : ''}`} placeholder="Enter selling price" />
            </div>
            {errors.selling_price && <p className="error-message">{errors.selling_price.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock <span className="required-indicator">*</span></label>
            <div className="quantity-input-group">
              <button type="button" onClick={() => setValue('stock', Math.max(0, stockQuantity - 1))} className="quantity-button"><Minus size={16} /></button>
              <input id="stock" type="number" {...register('stock')} className={`form-input quantity-input ${errors.stock ? 'input-error' : ''}`} placeholder="Enter current stock" />
              <button type="button" onClick={() => setValue('stock', stockQuantity + 1)} className="quantity-button"><Plus size={16} /></button>
            </div>
            {errors.stock && <p className="error-message">{errors.stock.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="min_stock">Minimum Stock <span className="required-indicator">*</span></label>
            <div className="quantity-input-group">
              <button type="button" onClick={() => setValue('min_stock', Math.max(0, minStockQuantity - 1))} className="quantity-button"><Minus size={16} /></button>
              <input id="min_stock" type="number" {...register('min_stock')} className={`form-input quantity-input ${errors.min_stock ? 'input-error' : ''}`} placeholder="Enter minimum stock alert level" />
              <button type="button" onClick={() => setValue('min_stock', minStockQuantity + 1)} className="quantity-button"><Plus size={16} /></button>
            </div>
            {errors.min_stock && <p className="error-message">{errors.min_stock.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category <span className="required-indicator">*</span></label>
            <div className="input-with-icon">
              <ClipboardList className="input-icon" />
              <input id="category" type="text" {...register('category')} className={`form-input ${errors.category ? 'input-error' : ''}`} placeholder="Enter product category" />
            </div>
            {errors.category && <p className="error-message">{errors.category.message}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="spinner" size={20} /> : <><CheckCircle size={20} /> {product ? 'Update Product' : 'Add Product'}</>}
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              <XCircle size={20} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
