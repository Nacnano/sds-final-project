import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shrineService } from '../services/shrineService';
import { wishService } from '../services/wishService';
import { techniqueService } from '../services/techniqueService';
import locationService from '../services/locationService';
import type { Shrine, Wish, Technique, CreateShrineRequest } from '../types';
import { getShrineImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import RatingDisplay from '../components/RatingDisplay';
import RatingModal from '../components/RatingModal';

const Shrines: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [shrines, setShrines] = useState<Shrine[]>([]);
  const [selectedShrine, setSelectedShrine] = useState<Shrine | null>(null);
  const [relatedWishes, setRelatedWishes] = useState<Wish[]>([]);
  const [relatedTechniques, setRelatedTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);5
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchShrines();
  }, []);

  useEffect(() => {
    if (id) {
      fetchShrineDetails(id);
    } else {
      // Clear selected shrine when navigating back to list
      setSelectedShrine(null);
    }
  }, [id]);

  const fetchShrines = async () => {
    try {
      setLoading(true);
      const data = await shrineService.getAll();
      setShrines(data);
    } catch (error) {
      console.error('Error fetching shrines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShrineDetails = async (shrineId: string) => {
    try {
      const shrine = await shrineService.getById(shrineId);
      setSelectedShrine(shrine);

      // Try to fetch wishes and techniques, but don't fail if they error
      try {
        const wishes = await wishService.getAll({ shrineId });
        // Sort by createdAt descending (most recent first)
        const sortedWishes = (wishes || []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRelatedWishes(sortedWishes);
      } catch (wishError) {
        console.warn('Wishes service not available:', wishError);
        setRelatedWishes([]);
      }

      try {
        const techniques = await techniqueService.getAll();
        setRelatedTechniques(techniques.filter((t) => t.shrineId === shrineId));
      } catch (techError) {
        console.warn('Techniques service not available:', techError);
        setRelatedTechniques([]);
      }
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
          wishes={relatedWishes}
          techniques={relatedTechniques}
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
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + Add Shrine
            </button>
          )}
        </div>

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
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(shrine.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
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
  wishes: Wish[];
  techniques: Technique[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ shrine, wishes, techniques, onBack, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showWishModal, setShowWishModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [refreshRatings, setRefreshRatings] = useState(0);

  const handleDeleteWish = async (wishId: string) => {
    if (!window.confirm('Are you sure you want to delete this wish?')) return;

    try {
      await wishService.delete(wishId);
      window.location.reload(); // Reload to refresh wishes
    } catch (error) {
      console.error('Error deleting wish:', error);
      alert('Failed to delete wish');
    }
  };

  const handleDeleteTechnique = async (techniqueId: string) => {
    if (!window.confirm('Are you sure you want to delete this technique?'))
      return;

    try {
      await techniqueService.delete(techniqueId);
      window.location.reload(); // Reload to refresh techniques
    } catch (error) {
      console.error('Error deleting technique:', error);
      alert('Failed to delete technique');
    }
  };

  const handleRatingSuccess = () => {
    setRefreshRatings((prev) => prev + 1);
  };

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

              {isAdmin && (
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
              )}
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        {user && (
          <div className="mb-8">
            <RatingDisplay
              key={refreshRatings}
              shrineId={shrine.id}
              onRateClick={() => setShowRatingModal(true)}
            />
          </div>
        )}

        {/* Related Wishes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Wishes at this Shrine ({wishes?.length || 0})
            </h2>
            {user && (
              <button
                onClick={() => setShowWishModal(true)}
                className="btn-primary"
              >
                + Add Wish
              </button>
            )}
          </div>
          {wishes && wishes.length > 0 ? (
            <div className="space-y-4">
              {wishes.map((wish) => (
                <div key={wish.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{wish.description}</p>
                      <div className="text-sm text-gray-500">
                        <span>👤 {wish.wisherName || 'Anonymous'}</span>
                        <span className="mx-2">•</span>
                        <span>
                          📅 {new Date(wish.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteWish(wish.id)}
                        className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove inappropriate wish"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-gray-50 text-center py-8">
              <p className="text-gray-500 mb-2">No wishes yet for this shrine.</p>
              <p className="text-sm text-gray-400">Be the first to make a wish!</p>
            </div>
          )}
        </div>

        {/* Related Techniques */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Blessing Techniques ({techniques?.length || 0})
            </h2>
            {user && (
              <button
                onClick={() => setShowTechniqueModal(true)}
                className="btn-primary"
              >
                + Add Technique
              </button>
            )}
          </div>
          {techniques && techniques.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {techniques.map((technique) => (
                <div key={technique.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {technique.title}
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTechnique(technique.id)}
                        className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                        title="Remove inappropriate technique"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {technique.description}
                  </p>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">
                      Ingredients:
                    </p>
                    <ul className="list-disc list-inside text-gray-600">
                      {technique.ingredients?.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-gray-50 text-center py-8">
              <p className="text-gray-500 mb-2">
                No techniques shared yet for this shrine.
              </p>
              <p className="text-sm text-gray-400">Share your blessing technique!</p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && user && (
        <RatingModal
          shrineId={shrine.id}
          shrineName={shrine.name}
          userId={user.id}
          onClose={() => setShowRatingModal(false)}
          onSuccess={handleRatingSuccess}
        />
      )}

      {/* Wish Modal */}
      {showWishModal && user && (
        <WishFormModal
          shrineId={shrine.id}
          shrineName={shrine.name}
          userId={user.id}
          userName={user.email}
          onClose={() => setShowWishModal(false)}
          onSuccess={() => {
            setShowWishModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* Technique Modal */}
      {showTechniqueModal && user && (
        <TechniqueFormModal
          shrineId={shrine.id}
          shrineName={shrine.name}
          userId={user.id}
          onClose={() => setShowTechniqueModal(false)}
          onSuccess={() => {
            setShowTechniqueModal(false);
            window.location.reload();
          }}
        />
      )}
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
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

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
                📍 Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
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

// Wish Form Modal
const WishFormModal: React.FC<{
  shrineId: string;
  shrineName: string;
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shrineId, shrineName, userId, userName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    wisherId: userId,
    shrineId: shrineId,
    wisherName: userName,
    description: '',
    public: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await wishService.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating wish:', error);
      alert('Failed to create wish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Make a Wish at {shrineName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Wish</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="I wish for..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Optional)</label>
            <input
              type="text"
              value={formData.wisherName}
              onChange={(e) => setFormData({ ...formData, wisherName: e.target.value })}
              className="input-field"
              placeholder="Leave blank for anonymous"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="public"
              checked={formData.public}
              onChange={(e) => setFormData({ ...formData, public: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="public" className="ml-2 text-sm text-gray-700">
              Make this wish public
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Creating...' : 'Create Wish'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Technique Form Modal
const TechniqueFormModal: React.FC<{
  shrineId: string;
  shrineName: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shrineId, shrineName, userId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    shrineId: shrineId,
    userId: userId,
    title: '',
    description: '',
    ingredients: [''],
  });
  const [loading, setLoading] = useState(false);

  const handleAddIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({ ...formData, ingredients: formData.ingredients.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedIngredients = formData.ingredients.filter(i => i.trim() !== '');
      await techniqueService.create({
        ...formData,
        ingredients: cleanedIngredients,
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating technique:', error);
      alert('Failed to create technique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Share a Technique for {shrineName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technique Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="e.g., Traditional Flower Offering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="Describe the blessing technique..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients/Items</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="e.g., Lotus flowers"
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + Add Another Item
            </button>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Sharing...' : 'Share Technique'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Shrines;
