import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Use Vite env or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProductAdd = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'women',
    stock: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = () => {
    const files = fileInputRef.current.files;
    setSelectedFiles(Array.from(files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice || formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);

      const files = fileInputRef.current.files;
      if (!files || files.length === 0) {
        throw new Error('Please select at least one image.');
      }

      for (let i = 0; i < files.length; i++) {
        formDataToSend.append('images', files[i]);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      };

      await axios.post(`${API_BASE_URL}/api/products`, formDataToSend, config);

      setSuccess('Product added successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Error adding product:', err);
      let errorMessage = 'Failed to add product.';
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'API endpoint not found.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = err.response.statusText;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Is it running?';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl px-4 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Add New Product</h1>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          <strong>Error:</strong> {error}
          {error.includes('API') && (
            <div className="mt-1 text-sm">
              Current API URL: <code>{API_BASE_URL}/api/products</code>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Original Price</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Stock *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Product Images *</label>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Select Images
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
            <span className="text-sm text-gray-500">
              {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          {selectedFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-gray-500">Supported: JPG, PNG, WEBP (Max 5MB each)</p>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAdd;
