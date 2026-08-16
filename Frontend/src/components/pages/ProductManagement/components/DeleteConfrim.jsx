import ConfirmDeleteModal from '../../../shared/ConfirmDeleteModal';
import { deleteProduct, deleteProductGroup } from '../../../../services/api';

export default function DeleteConfirm({ record, onClose, onDeleted, feture }) {
  const isProduct = feture === 'product';
  return (
    <ConfirmDeleteModal
      onClose={onClose}
      onDeleted={onDeleted}
      onConfirm={() =>
        isProduct ? deleteProduct(record.product_id) : deleteProductGroup(record.product_group_id)
      }
      summary={[
        {
          label: isProduct ? 'Product' : 'Product Group',
          value: isProduct ? record.product_code : record.product_group_name,
        },
      ]}
    />
  );
}
