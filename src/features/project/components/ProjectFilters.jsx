import { Form, InputGroup, Button } from 'react-bootstrap';
import styles from '../styles/ProjectOverview.module.css';

export function ProjectFilters({ filters, onChange, onClear }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className={styles.filters}>
      <Form.Select
        value={filters.type}
        onChange={(e) => handleChange('type', e.target.value)}
        className={styles.filterSelect}
      >
        <option value="all">Tất cả loại</option>
        <option value="owned">Tự tổ chức</option>
        <option value="joined">Đã tham gia</option>
      </Form.Select>

      <Form.Select
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        className={styles.filterSelect}
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="ongoing">Đang diễn ra</option>
        <option value="completed">Hoàn thành</option>
      </Form.Select>

      <InputGroup className={styles.searchGroup}>
        <Form.Control
          type="text"
          placeholder="Tìm theo tiêu đề..."
          value={filters.q}
          onChange={(e) => handleChange('q', e.target.value)}
        />
      </InputGroup>

      <Button
        variant="outline-secondary"
        onClick={onClear}
        className={styles.clearBtn}
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
}

export default ProjectFilters;
