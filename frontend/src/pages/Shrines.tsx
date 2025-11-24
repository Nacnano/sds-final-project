import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shrineService } from '../services/shrineService';
import locationService from '../services/locationService';
import type { Shrine, CreateShrineRequest } from '../types';
import { getShrineImageUrl } from '../utils/imageUtils';

const Shrines: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shrines, setShrines] = useState<Shrine[]>([]);
  const [selectedShrine, setSelectedShrine] = useState<Shrine | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchRadius, setSearchRadius] = useState(5);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchShrines();
  }, []);

  useEffect(() => {
    if (id) {
      fetchShrineDetails(id);
    } else {
      setSelectedShrine(null);
    }
  }, [id]);

  const fetchShrines = async () => {
    try {
      setLoading(true);
      const data = await shrineService.getAll();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setShrines(data);
      } else {
        console.warn('Shrines data is not an array:', data);
        setShrines([]);
      }
    } catch (error) {
      console.error('Error fetching shrines:', error);
      setShrines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) {
      fetchShrines();
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const data = await shrineService.findNearby(searchLocation, searchRadius);
      setShrines(data);
    } catch (error) {
      console.error('Error searching shrines:', error);
      alert('Failed to search shrines. Please check the location and try again.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchShrineDetails = async (shrineId: string) => {
    try {
      const shrine = await shrineService.getById(shrineId);
      setSelectedShrine(shrine);
    } catch (error) {
      console.error('Error fetching shrine details:', error);
    }
  };

  const handleDelete = async (shrineId: string) => {
    if (!window.confirm('Are you sure you want to delete this shrine?')) return;

    try {
      await shrineService.delete(shrineId);
      setShrines(shrines.filter((s) => s.id !== shrineId));
      setSelectedShrine(null);
    } catch (error) {
      console.error('Error deleting shrine:', error);
      alert('Failed to delete shrine');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (selectedShrine) {
    return (
      <>
        <ShrineDetail
          shrine={selectedShrine}
          onBack={() => setSelectedShrine(null)}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => handleDelete(selectedShrine.id)}
        />
        {showEditModal && (
          <ShrineFormModal
            shrine={selectedShrine}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              fetchShrineDetails(selectedShrine.id);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shrines</h1>
            <p className="text-gray-600 mt-2">
              Discover and explore sacred shrines across Thailand
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Add Shrine
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Location
              </label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="e.g., Siam, Bangkok"
                className="input-field"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (km)
              </label>
              <input
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                min="0.1"
                max="100000"
                step="0.1"
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSearching}
                className="btn-primary whitespace-nowrap"
              >
                {isSearching ? 'Searching...' : 'Search Nearby'}
              </button>
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocation('');
                    fetchShrines();
                  }}
                  className="btn-secondary whitespace-nowrap"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {searchLocation && !loading && shrines.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">
              🎯 Found {shrines.length} shrine{shrines.length !== 1 ? 's' : ''} within {searchRadius} km of "{searchLocation}"
            </p>
          </div>
        )}

        {shrines.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium mb-2">
              {isSearching || searchLocation ? '🔍 No shrines found in this area' : '📍 No shrines available'}
            </p>
            <p className="text-yellow-600 text-sm">
              {isSearching || searchLocation 
                ? 'Try searching with a different location or increase the search radius.' 
                : 'Start by adding a shrine or use the search feature.'}
            </p>
            {searchLocation && (
              <button
                onClick={() => {
                  setSearchLocation('');
                  fetchShrines();
                }}
                className="mt-4 btn-secondary"
              >
                View All Shrines
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shrines.map((shrine) => (
            <div key={shrine.id} className="card group">
              <img
                src={getShrineImageUrl(shrine.id, 400, 250, shrine.imageUrl)}
                alt={shrine.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {shrine.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {shrine.description}
              </p>
              <p className="text-xs text-gray-500 mb-4">📍 {shrine.location}</p>

              <div className="flex gap-2">
                <Link
                  to={`/shrines/${shrine.id}`}
                  onClick={() => setSelectedShrine(shrine)}
                  className="flex-1 btn-primary text-center text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(shrine.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {shrines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No shrines found. Add your first shrine!
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <ShrineFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchShrines();
          }}
        />
      )}
    </div>
  );
};

// Shrine Detail Component
const ShrineDetail: React.FC<{
  shrine: Shrine;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ shrine, onBack, onEdit, onDelete }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={onBack} className="btn-secondary mb-6">
          ← Back to Shrines
        </button>

        <div className="card mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={getShrineImageUrl(shrine.id, 600, 400, shrine.imageUrl)}
                alt={shrine.name}
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {shrine.name}
              </h1>
              <p className="text-gray-700 mb-4">{shrine.description}</p>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p>
                  📍 <span className="font-medium">Location:</span>{' '}
                  {shrine.location}
                </p>
                <p>
                  📅 <span className="font-medium">Created:</span>{' '}
                  {new Date(shrine.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={onEdit} className="btn-primary">
                  Edit Shrine
                </button>
                <button
                  onClick={onDelete}
                  className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete Shrine
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shrine Form Modal
const ShrineFormModal: React.FC<{
  shrine?: Shrine;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shrine, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateShrineRequest>({
    name: shrine?.name || '',
    description: shrine?.description || '',
    location: shrine?.location || '',
    imageUrl: shrine?.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [validatingLocation, setValidatingLocation] = useState(false);
  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleLocationBlur = async () => {
    if (!formData.location.trim()) {
      setLocationValid(null);
      setCoordinates(null);
      return;
    }

    try {
      setValidatingLocation(true);
      setLocationValid(null);
      const coords = await locationService.getCoordinates(formData.location);
      setCoordinates(coords);
      setLocationValid(true);
    } catch (error) {
      console.error('Location validation failed:', error);
      setLocationValid(false);
      setCoordinates(null);
    } finally {
      setValidatingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate location if not already validated
    if (locationValid === null && formData.location) {
      await handleLocationBlur();
      return;
    }

    setLoading(true);

    try {
      if (shrine) {
        await shrineService.update(shrine.id, formData);
      } else {
        await shrineService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving shrine:', error);
      alert('Failed to save shrine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">
          {shrine ? 'Edit' : 'Add'} Shrine
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shrine Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Erawan Shrine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field"
              rows={3}
              placeholder="Describe the shrine and its significance..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  setLocationValid(null);
                  setCoordinates(null);
                }}
                onBlur={handleLocationBlur}
                className={`input-field pr-10 ${
                  locationValid === true
                    ? 'border-green-500 focus:ring-green-500'
                    : locationValid === false
                      ? 'border-red-500 focus:ring-red-500'
                      : ''
                }`}
                placeholder="Ratchadamri Rd, Bangkok"
              />
              {validatingLocation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
              {locationValid === true && !validatingLocation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">
                  ✓
                </div>
              )}
              {locationValid === false && !validatingLocation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600">
                  ✗
                </div>
              )}
            </div>
            {coordinates && (
              <p className="text-xs text-gray-600 mt-1">
                📍 Coordinates: {coordinates.lat.toFixed(4)},{' '}
                {coordinates.lng.toFixed(4)}
              </p>
            )}
            {locationValid === false && (
              <p className="text-xs text-red-600 mt-1">
                Unable to find this location. Please check the address.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a URL to a custom image for this shrine
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Shrines;
