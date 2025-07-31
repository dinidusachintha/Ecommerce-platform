import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Upload, AlertCircle } from 'lucide-react';

const ProductUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    productname: '',
    description: '',
    price: '',
    category: 'women',
    stock: 'in-stock',
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        const product = response.data;
        setFormData({
          productname: product.productname,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
        });
        setExistingImages(product.images || []);
        setIsFetching(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data');
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed');
        return false;
      }
      
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    setError('');
    setImages(validFiles);
    
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleRemoveExistingImage = (image) => {
    setExistingImages(existingImages.filter(img => img !== image));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('productname', formData.productname);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('existingImages', JSON.stringify(existingImages));
      
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      const response = await axios.put(`http://localhost:5000/api/products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      navigate('/');
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-6 text-center">Loading product data...</div>;
  }

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Update Product</h2>
      
      {error && (
        <div className="flex items-center p-4 mb-6 text-red-600 bg-red-100 rounded-lg">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Stock Status
            </label>
            <select
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="limited">Limited Stock</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Product Images
            </label>
            
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Existing Images</p>
                <div className="grid grid-cols-3 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="object-cover w-full h-32 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image)}
                        className="absolute p-1 text-white bg-red-600 rounded-full top-1 right-1 hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-600">
                Drag & drop new images here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg cursor-pointer hover:bg-pink-700"
              >
                Select Images
              </label>
              <p className="mt-2 text-xs text-gray-500">
                JPEG, PNG, or WebP (Max 5MB each)
              </p>
            </div>
            
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-32 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-8 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductUpdate;