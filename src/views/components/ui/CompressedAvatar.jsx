import React, { useEffect, useState } from 'react';
import { Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const imageCompressionCache = new Map();

/**
 * @param {string} base64OrDataUrl
 * @param {{maxWidth?: number, maxHeight?: number, quality?: number}} options
 * @returns {Promise<string>}
 */
function compressAndResizeBase64(
  base64OrDataUrl,
  { maxWidth = 80, maxHeight = 80, quality = 0.4 } = {}
) {
  return new Promise((resolve) => {
    const img = new Image();

    const normalized =
      base64OrDataUrl?.startsWith?.('data:')
        ? base64OrDataUrl
        : base64OrDataUrl
        ? `data:image/jpeg;base64,${base64OrDataUrl}`
        : '';

    img.onload = () => {
      const { width, height } = img;

      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      const targetW = Math.round(width * scale);
      const targetH = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const out = canvas.toDataURL('image/jpeg', quality);
      resolve(out);
    };

    img.src = normalized || '';
  });
}

export default function CompressedAvatar({
  src,
  alt = 'avatar',
  size = 40,
  quality = 0.3,
  dprFactor = 2,
  ...avatarProps
}) {
  const [outSrc, setOutSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!src) {
      setOutSrc(null);
      return;
    }

    const normalized = src.startsWith?.('data:') ? src : `data:image/jpeg;base64,${src}`;
    const cacheKey = `${normalized}::${size}::${quality}::${dprFactor}`;

    const cached = imageCompressionCache.get(cacheKey);
    if (cached) {
      setOutSrc(cached);
      return;
    }

    compressAndResizeBase64(normalized, {
      maxWidth: size * dprFactor,
      maxHeight: size * dprFactor,
      quality,
    }).then((res) => {
      if (!cancelled) {
        imageCompressionCache.set(cacheKey, res);
        setOutSrc(res);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src, size, quality, dprFactor]);

  return (
    <Avatar
      sx={{ width: size, height: size }}
      src={outSrc || (src?.startsWith?.('data:') ? src : src ? `data:image/jpeg;base64,${src}` : undefined)}
      imgProps={{ loading: 'lazy' }}
      alt={alt}
      {...avatarProps}
    >
      {!src && <PersonIcon sx={{ fontSize: size * 0.6 }} />}
    </Avatar>
  );
}
