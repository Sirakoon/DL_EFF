import { HiXMark, HiChatBubbleBottomCenterText } from 'react-icons/hi2';

/**
 * Shared read-only detail popup for a table cell whose text is too long to
 * show inline (e.g. Loss Reason). `meta` renders a small context line
 * (date / machine / product) above the full text.
 */
export default function LossReasonModal({ title = 'Loss Reason', text, meta = [], onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-7">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <HiChatBubbleBottomCenterText className="text-amber-500 text-2xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-gray-900 text-base">{title}</h3>
              {meta.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{meta.filter(Boolean).join(' · ')}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer flex-shrink-0"
            >
              <HiXMark className="text-xl" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 border border-gray-100 whitespace-pre-wrap break-words max-h-[50vh] overflow-y-auto">
            {text || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
