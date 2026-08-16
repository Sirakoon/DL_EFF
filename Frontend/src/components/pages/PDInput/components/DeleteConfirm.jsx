import ConfirmDeleteModal from '../../../shared/ConfirmDeleteModal';
import { deletePdInput } from '../../../../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.slice(0, 10).split('-'); return `${d} ${MONTHS[+m - 1]} ${y}`; };

export default function DeleteConfirm({ record, onClose, onDeleted }) {
  return (
    <ConfirmDeleteModal
      onClose={onClose}
      onDeleted={onDeleted}
      onConfirm={() => deletePdInput(record.record_id)}
      summary={[
        { label: 'Date', value: fmtDate(record.production_date) },
        { label: 'Shift', value: record.shift_code },
        { label: 'Machine', value: record.machine_code },
        { label: 'Product', value: record.product_code },
      ]}
    />
  );
}
