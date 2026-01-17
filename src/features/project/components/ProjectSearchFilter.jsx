import { Row, Col, Form } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import styles from '../styles/ProjectListPage.module.css';

export function ProjectSearchFilter({ 
  searchValue, 
  onSearchChange, 
  statusFilter, 
  onStatusChange,
  sortBy,
  onSortChange 
}) {
  return (
    <div className={styles.searchFilterSection}>
      <Row className="g-3">
        <Col md={6}>
          <div className={styles.searchBar}>
            <FiSearch size={18} className={styles.searchIcon} />
            <Form.Control
              type="text"
              className={styles.searchInput}
              placeholder="Search campaigns..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </Col>
        <Col md={3}>
          <Form.Select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="createdAt">Newest First</option>
            <option value="title">Title A-Z</option>
            <option value="financialGoal">Highest Goal</option>
            <option value="startDate">Start Date</option>
          </Form.Select>
        </Col>
      </Row>
    </div>
  );
}
