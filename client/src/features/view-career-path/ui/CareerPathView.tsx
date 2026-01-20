import { useEffect, useState } from 'react';
import { useAuth } from '@app/providers/AuthProvider';
import { CareerGraph } from '@widgets/career-graph/ui/CareerGraph';
import { careerPathsApi } from '../api/careerPathsApi';
import type { CareerGraph as CareerGraphType } from '../api/careerPathsApi';
import type { Position } from '@entities/position/types';
import { Modal } from '@shared/ui/Modal';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { ErrorMessage } from '@shared/ui/ErrorMessage';
import { positionApi } from '@entities/position/api/positionApi';

export const CareerPathView = () => {
  const { user, logout } = useAuth();
  const [graph, setGraph] = useState<CareerGraphType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [positionDetails, setPositionDetails] = useState<any>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setError(null);
      const data = await careerPathsApi.getCareerGraph();
      setGraph(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load career graph');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (position: Position) => {
    setSelectedPosition(position);
    try {
      const details = await positionApi.getById(position.id);
      setPositionDetails(details);
    } catch (err: any) {
      console.error('Failed to load position details:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message={error} />
        <Button onClick={loadGraph} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message="No career graph data available" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Career Paths</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="secondary" onClick={() => (window.location.href = '/profile')}>
                Profile
              </Button>
              {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                <Button variant="secondary" onClick={() => (window.location.href = '/admin/positions')}>
                  Admin
                </Button>
              )}
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Career Path Visualization</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span>Vertical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span>Horizontal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-orange-500"></div>
                <span>Change</span>
              </div>
            </div>
          </div>
          <CareerGraph positions={graph.positions} transitions={graph.transitions} onNodeClick={handleNodeClick} />
        </Card>
      </div>

      <Modal isOpen={!!selectedPosition} onClose={() => setSelectedPosition(null)} title={selectedPosition?.title}>
        {positionDetails && (
          <div className="space-y-4">
            <div>
              <strong>Department:</strong> {positionDetails.department}
            </div>
            <div>
              <strong>Level:</strong> {positionDetails.level}
            </div>
            {positionDetails.from && positionDetails.from.length > 0 && (
              <div>
                <strong>Available Transitions:</strong>
                <ul className="list-disc list-inside mt-2">
                  {positionDetails.from.map((transition: any) => (
                    <li key={transition.id}>
                      {transition.toPosition.title} ({transition.type})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

