import { useState, useEffect } from 'react';
import { Blurhash } from 'react-blurhash';
import clsx from 'clsx';
import styles from './AdaptiveImage.module.css';

const AdaptiveImage = ({ media, alt = "Post image", className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const containerStyle = (media.width && media.height) 
    ? { aspectRatio: `${media.width} / ${media.height}` } 
    : { aspectRatio: '16/9' };

  return (
    <div 
      className={clsx(styles.container, className)} 
      style={containerStyle}
    >
      {media.blurHash && (
        <div className={styles.blurHash}>
            <Blurhash
                hash={media.blurHash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
            />
        </div>
      )}

      <img
        src={media.url} 
        alt={alt}
        className={clsx(styles.img, isLoaded && styles.loaded)}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default AdaptiveImage;