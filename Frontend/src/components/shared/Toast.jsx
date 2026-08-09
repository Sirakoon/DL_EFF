import { useEffect, useState } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamationTriangle, HiXMark } from 'react-icons/hi2';
import { toast } from '../../lib/toast';

const STYLES = {
  success: { bar: 'bg-green-500', icon: <HiCheckCircle className="text-green-500 text-xl flex-shrink-0" />, text: 'text-green-800', bg: 'bg-green-50 border-green-200' },
  error: { bar: 'bg-red-500', icon: <HiXCircle className="text-red-500   text-xl flex-shrink-0" />, text: 'text-red-800', bg: 'bg-red-50   border-red-200' },
  info: { bar: 'bg-blue-500', icon: <HiInformationCircle className="text-blue-500  text-xl flex-shrink-0" />, text: 'text-blue-800', bg: 'bg-blue-50  border-blue-200' },
  warning: { bar: 'bg-amber-500', icon: <HiExclamationTriangle className="text-amber-500 text-xl flex-shrink-0" />, text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
};

function ToastItem({ type, message, duration, onDone }) {
  const [visible, setVisible] = useState(false);
  const s = STYLES[type] ?? STYLES.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, duration);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 border rounded-2xl px-4 py-3 shadow-lg min-w-[280px] max-w-sm transition-all duration-300 ${s.bg} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}
    >
      {/* colour bar */}
      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${s.bar}`} style={{ position: 'absolute' }} />
      <div className="pl-2 flex items-start gap-3 w-full">
        {s.icon}
        <span className={`text-sm font-semibold flex-1 leading-snug ${s.text}`}>{message}</span>
        <button onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
          className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 mt-0.5">
          <HiXMark className="text-base" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return toast._subscribe((item) => {
      setItems((prev) => [...prev, item]);
    });
  }, []);

  const remove = (id) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto relative">
          <ToastItem {...t} onDone={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}
