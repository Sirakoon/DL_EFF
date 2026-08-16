import ConfirmDeleteModal from '../../../shared/ConfirmDeleteModal';
import { deleteMachines } from '../../../../services/api';

export default function DeleteConfirm({ record, onClose, onDeleted }) {
  return (
    <ConfirmDeleteModal
      onClose={onClose}
      onDeleted={onDeleted}
      onConfirm={() => deleteMachines(record.machine_id)}
      summary={[{ label: 'Machine', value: record.machine_code }]}
    />
  );
}
