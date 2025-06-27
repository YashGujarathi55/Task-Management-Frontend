import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { MapPin, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    assigned_to: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    loadGoogleMapsAPI();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data.users.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const loadGoogleMapsAPI = () => {
    if (window.google) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeAutocomplete;
    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    const input = document.getElementById('address-input');
    if (!input || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setFormData(prev => ({
          ...prev,
          address: place.formatted_address || place.name,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        }));
      }
    });
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        // Reverse geocoding to get address
        try {
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };
            
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === 'OK' && results[0]) {
                setFormData(prev => ({
                  ...prev,
                  address: results[0].formatted_address
                }));
              }
            });
          }
        } catch (error) {
          console.error('Error getting address:', error);
        }
        
        setLocationLoading(false);
        toast.success('Location detected successfully');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get current location');
        setLocationLoading(false);
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    document.getElementById('image-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      formDataToSend.append('assigned_to', formData.assigned_to || '');
      
      if (image) {
        formDataToSend.append('image', image);
      }

      await taskService.createTask(formDataToSend);
      toast.success('Task created successfully');
      navigate('/tasks');
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="space-y-3">
              <input
                type="text"
                id="address-input"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for an address"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <MapPin size={16} />
                <span>{locationLoading ? 'Getting location...' : 'Use Current Location'}</span>
              </button>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-sm text-gray-500 mt-2">
                Coordinates: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
              Assign to User (Optional)
            </label>
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user (optional)</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="image-input" className="block text-sm font-medium text-gray-700 mb-2">
              Task Image (Optional)
            </label>
            <div className="space-y-3">
              <input
                type="file"
                id="image-input"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;