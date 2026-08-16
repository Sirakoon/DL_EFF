import { useState } from 'react';
import { HiExclamationTriangle, HiTrash } from 'react-icons/hi2';
import { TbLoader2 } from 'react-icons/tb';
import { toast } from '../../lib/toast';

/**
 * Shared delete-confirmation dialog. `onConfirm` performs the actual delete
 * API call (throw on failure); `summary` renders the record's key fields.
 */
export default function ConfirmDeleteModal({ summary = [], onClose, onDeleted, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
      toast.success('Record deleted');
      onDeleted();
    } catch (e) {
      toast.error(e.message);
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-7">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <HiExclamationTriangle className="text-red-500 text-2xl" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base">Confirm Delete</h3>
              <p className="text-sm text-gray-500 mt-0.5">This record will be permanently deleted and cannot be recovered.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1.5 mb-5 border border-gray-100">
            {summary.map(({ label, value }) => (
              <div className="flex justify-between" key={label}>
                <span className="text-gray-400 font-medium">{label}</span>
                <span className="font-semibold text-gray-700">{value}</span>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</p>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-60 transition shadow-md shadow-red-200 cursor-pointer"
            >
              {loading ? <TbLoader2 className="animate-spin" /> : <HiTrash />}
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
