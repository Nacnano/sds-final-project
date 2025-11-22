import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shrineService } from '../services/shrineService';
import type { Shrine } from '../types';
import { getShrineImageUrl } from '../utils/imageUtils';

const Dashboard: React.FC = () => {
  const [shrines, setShrines] = useState<Shrine[]>([]);
  const [allShrines, setAllShrines] = useState<Shrine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shrines
        const shrinesData = await shrineService.getAll();
        setAllShrines(shrinesData);
        setShrines(shrinesData.slice(0, 3)); // Show first 3 shrines
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">Welcome! 🙏</h1>
          <p className="text-xl text-primary-100">
            Your spiritual journey awaits. Explore shrines and find blessings.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Shrines</p>
                <p className="text-3xl font-bold text-primary-600">
                  {allShrines.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⛩️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Shrines */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Shrines
            </h2>
            <Link
              to="/shrines"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shrines && shrines.length > 0 ? (
              shrines.map((shrine) => (
                <Link
                  to={`/shrines/${shrine.id}`}
                  key={shrine.id}
                  className="card hover:scale-105 transition-transform"
                >
                  <img
                    src={getShrineImageUrl(
                      shrine.id,
                      400,
                      250,
                      shrine.imageUrl,
                    )}
                    alt={shrine.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {shrine.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {shrine.description}
                  </p>
                  <p className="text-xs text-gray-500">📍 {shrine.location}</p>
                </Link>
              ))
            ) : (
              <div className="col-span-3 card bg-gray-50 text-center py-8">
                <p className="text-gray-500">No shrines available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
