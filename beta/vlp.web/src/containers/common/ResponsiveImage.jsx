import React, { useState } from 'react';
import { APP_URLS } from "../../config/api.config";

const ResponsiveImage = ({src, alt, ...props}) => {
    const fallback = `${APP_URLS.API_URL}/Upload/default_user.png`;
    const [imgSrc, setImgSrc] = useState(`${APP_URLS.API_URL}${src}`)
  const onError = () => setImgSrc(fallback)
    return (
        <img
        src={imgSrc ? imgSrc : fallback} onError={onError}
        alt={alt}
        {...props}
     />
    )
}

export default ResponsiveImage;