import { useState, useEffect } from 'react';
import { SCORM as SCORM_API, debug } from 'pipwerks-scorm-api-wrapper';

const { NODE_ENV } = process.env;

const useSCORMPackage = () => {
  const [SCORM, setSCORM] = useState();

  useEffect(() => {
    if (NODE_ENV === 'development') {
      const script = document.createElement('script');
      script.src = './_dev.SCORM.js';
      script.async = false;
      script.onload = () => {
        console.log('SCORM API Wrapper loaded successfully');
        setSCORM(window.API);
      };
      document.body.appendChild(script);
    } else {
      setSCORM(SCORM_API);
    }
  }, []);

  return { SCORM, debug };
};
export default useSCORMPackage;
