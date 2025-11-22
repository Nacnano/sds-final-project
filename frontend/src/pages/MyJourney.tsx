import React, { useEffect, useState } from 'react';
import { wishService } from '../services/wishService';
import { techniqueService } from '../services/techniqueService';
import { shrineService } from '../services/shrineService';
import type { Wish, Technique, Shrine, CreateWishRequest, CreateTechniqueRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';

const MyJourney: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'wishes' | 'techniques'>('wishes');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [shrines, setShrines] = useState<Shrine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWishModal, setShowWishModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch wishes - admin sees all, users see only their own
      try {
        const wishesData = isAdmin 
          ? await wishService.getAll({}) 
          : await wishService.getAll({ wisherId: user?.id });
        // Sort by createdAt descending (most recent first)
        const sortedWishes = (wishesData || []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setWishes(sortedWishes);
      } catch (wishError) {
        console.warn('Error fetching wishes:', wishError);
        setWishes([]);
      }

      // Fetch techniques - admin sees all, users see only their own
      try {
        const techniquesData = await techniqueService.getAll();
        setTechniques(
          isAdmin 
            ? (techniquesData || [])
            : (techniquesData || []).filter(t => t.userId === user?.id)
        );
      } catch (techError) {
        console.warn('Error fetching techniques:', techError);
        setTechniques([]);
      }

      // Fetch shrines
      try {
        const shrinesData = await shrineService.getAll();
        setShrines(shrinesData || []);
      } catch (shrineError) {
        console.warn('Error fetching shrines:', shrineError);
        setShrines([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this wish?')) return;
    
    try {
      await wishService.delete(id);
      setWishes(wishes.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting wish:', error);
      alert('Failed to delete wish');
    }
  };

  const handleDeleteTechnique = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this technique?')) return;
    
    try {
      await techniqueService.delete(id);
      setTechniques(techniques.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting technique:', error);
      alert('Failed to delete technique');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'All Content Management' : 'My Spiritual Journey'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin 
              ? 'Manage all wishes and techniques - remove inappropriate content'
              : 'Track your wishes and share your blessing techniques'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('wishes')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'wishes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {isAdmin ? 'All Wishes' : 'My Wishes'} ({wishes.length})
          </button>
          <button
            onClick={() => setActiveTab('techniques')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'techniques'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {isAdmin ? 'All Techniques' : 'My Techniques'} ({techniques.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'wishes' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isAdmin ? 'All Wishes' : 'Your Wishes'}
              </h2>
              {!isAdmin && (
                <button onClick={() => setShowWishModal(true)} className="btn-primary">
                  + Add Wish
                </button>
              )}
            </div>

            <div className="space-y-4">
              {wishes && wishes.length > 0 ? (
                wishes.map((wish) => (
                  <div key={wish.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                            {shrines.find(s => s.id === wish.shrineId)?.name || 'Unknown Shrine'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            wish.public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {wish.public ? 'Public' : 'Private'}
                          </span>
                          {isAdmin && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              By: {wish.wisherName || 'Anonymous'}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 mb-2">{wish.description}</p>
                        <p className="text-xs text-gray-500">📅 {new Date(wish.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteWish(wish.id)}
                        className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        title={isAdmin ? 'Remove inappropriate wish' : 'Delete your wish'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : null}

              {(!wishes || wishes.length === 0) && (
                <div className="text-center py-12 card">
                  <p className="text-gray-500">
                    {isAdmin ? 'No wishes found in the system.' : "You haven't made any wishes yet."}
                  </p>
                  {!isAdmin && (
                    <button onClick={() => setShowWishModal(true)} className="btn-primary mt-4">
                      Make Your First Wish
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isAdmin ? 'All Techniques' : 'Your Techniques'}
              </h2>
              {!isAdmin && (
                <button onClick={() => setShowTechniqueModal(true)} className="btn-primary">
                  + Add Technique
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {techniques && techniques.length > 0 ? (
                techniques.map((technique) => (
                  <div key={technique.id} className="card">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {shrines.find(s => s.id === technique.shrineId)?.name || 'Unknown Shrine'}
                        </span>
                        {isAdmin && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            User ID: {technique.userId}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTechnique(technique.id)}
                        className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                        title={isAdmin ? 'Remove inappropriate technique' : 'Delete your technique'}
                      >
                        Delete
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{technique.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{technique.description}</p>
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-1">Ingredients:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {technique.ingredients?.map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : null}

              {(!techniques || techniques.length === 0) && (
                <div className="col-span-2 text-center py-12 card">
                  <p className="text-gray-500">
                    {isAdmin ? 'No techniques found in the system.' : "You haven't shared any techniques yet."}
                  </p>
                  {!isAdmin && (
                    <button onClick={() => setShowTechniqueModal(true)} className="btn-primary mt-4">
                      Share Your First Technique
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showWishModal && (
        <WishFormModal
          shrines={shrines}
          userId={user?.id || ''}
          userName={user?.email || 'Anonymous'}
          onClose={() => setShowWishModal(false)}
          onSuccess={() => {
            setShowWishModal(false);
            fetchData();
          }}
        />
      )}

      {showTechniqueModal && (
        <TechniqueFormModal
          shrines={shrines}
          userId={user?.id || ''}
          onClose={() => setShowTechniqueModal(false)}
          onSuccess={() => {
            setShowTechniqueModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Wish Form Modal
const WishFormModal: React.FC<{
  shrines: Shrine[];
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shrines, userId, userName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateWishRequest>({
    wisherId: userId,
    shrineId: '',
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
        <h2 className="text-2xl font-bold mb-4">Make a Wish</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Shrine</label>
            <select
              required
              value={formData.shrineId}
              onChange={(e) => setFormData({ ...formData, shrineId: e.target.value })}
              className="input-field"
            >
              <option value="">Choose a shrine...</option>
              {shrines.map(shrine => (
                <option key={shrine.id} value={shrine.id}>{shrine.name}</option>
              ))}
            </select>
          </div>

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
  shrines: Shrine[];
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shrines, userId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateTechniqueRequest & { userId: string }>({
    shrineId: '',
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
        <h2 className="text-2xl font-bold mb-4">Share a Technique</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Shrine</label>
            <select
              required
              value={formData.shrineId}
              onChange={(e) => setFormData({ ...formData, shrineId: e.target.value })}
              className="input-field"
            >
              <option value="">Choose a shrine...</option>
              {shrines.map(shrine => (
                <option key={shrine.id} value={shrine.id}>{shrine.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technique Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Morning Blessing Ritual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Describe how to perform this blessing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients/Items Needed</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  className="input-field"
                  placeholder="Incense sticks, flowers, etc."
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + Add Ingredient
            </button>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : 'Share Technique'}
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

export default MyJourney;
