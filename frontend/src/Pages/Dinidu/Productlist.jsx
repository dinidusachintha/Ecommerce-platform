import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data.products || response.data); // Handle paginated or non-paginated response
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/products/delete/${id}`);
      setProducts(products.filter(product => product._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      if (err.response?.status === 404) {
        setError('Product not found. It may have been already deleted.');
      } else {
        setError(err.response?.data?.error || 'Failed to delete product. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading products...</div>;
  }

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Product List</h2>

      {error && (
        <div className="flex items-center p-4 mb-6 text-red-600 bg-red-100 rounded-lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div key={product._id} className="p-4 transition-shadow border border-gray-300 rounded-lg hover:shadow-lg">
              <div className="flex items-center mb-3">
                {product.images && product.images.length > 0 && (
                  <img
                    src={`http://localhost:5000/Images/${product.images[0]}`}
                    alt={product.productname}
                    className="object-cover w-24 h-24 mr-3 rounded"
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }} // Fallback image
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{product.productname}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
              </div>
              <p className="text-gray-600 line-clamp-2">{product.description}</p>
              <p className="mt-2 font-medium text-gray-800">${product.price}</p>
              <p className={`mt-1 text-sm ${product.stock === 'in-stock' ? 'text-green-600' : product.stock === 'out-of-stock' ? 'text-red-600' : 'text-yellow-600'}`}>
                {product.stock.replace('-', ' ').toUpperCase()}
              </p>
              <div className="flex justify-end mt-3 space-x-2">
                <button
                  onClick={() => navigate(`/update/${product._id}`)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Edit product"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => confirmDelete(product._id)}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Delete product"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {deleteConfirm === product._id && (
                <div className="p-3 mt-3 bg-gray-100 rounded-lg">
                  <p className="mb-2 text-sm text-gray-700">Are you sure you want to delete {product.productname}?</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelDelete}
                      className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate('/add')}
          className="px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
        >
          Add New Product
        </button>
      </div>
    </div>
  );
};

export default ProductList;