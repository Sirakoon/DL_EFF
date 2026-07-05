/* Simple pub-sub toast — import { toast } from '../lib/toast' then call toast.success('msg') */

let _uid = 0;
const _subs = new Set();

function emit(item) {
  _subs.forEach((fn) => fn(item));
}

export const toast = {
  success: (message, duration = 3500) => emit({ id: ++_uid, type: 'success', message, duration }),
  error: (message, duration = 5000) => emit({ id: ++_uid, type: 'error', message, duration }),
  info: (message, duration = 3500) => emit({ id: ++_uid, type: 'info', message, duration }),
  warning: (message, duration = 4000) => emit({ id: ++_uid, type: 'warning', message, duration }),
  _subscribe: (fn) => { _subs.add(fn); return () => _subs.delete(fn); },
};
