import styles from './Button.module.css';
import clsx from 'clsx';
import { Spinner } from 'react-bootstrap'; 


export function Button({ 
  children, 
  variant = 'yellow', 
  className, 
  isLoading = false, 
  disabled, 
  ...props 
}) {
  return (
    <button
      className={clsx(styles.base, styles[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}