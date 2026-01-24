import styles from '../styles/PostsPlaceholder.module.css';

export function PostsPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <h3>No posts yet</h3>
      <p>When you create posts, they will appear here.</p>
    </div>
  );
}

export default PostsPlaceholder;
