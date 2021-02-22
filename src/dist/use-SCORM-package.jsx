import { useState, useEffect } from 'react';
import { SCORM as SCORM_API, debug } from 'pipwerks-scorm-api-wrapper';

const { NODE_ENV } = process.env;

const useSCORMPackage = () => {
  const [SCORM, setSCORM] = useState(null);

  useEffect(() => {
    if (NODE_ENV === 'development') {
      const script = document.createElement('script');
      script.innerHTML = `
        // mock SCORM API for development
        window.API = (function(){
          var data = {
            "cmi.core.student_id": "000010",
            "cmi.core.student_name": "Doe, Henry",
            "cmi.core.lesson_location": "0",
            "cmi.core.lesson_status": "not attempted",
          };
          return {
            init: function() {
              return "true";
            },
            get: function(model) {
              return data[model] || "";
            },
            set: function(model, value) {
              data[model] = value;
              return "true";
            },
            status: function(method, st) {
              if (method === 'get') {
                return data["cmi.core.lesson_status"];
              } else if (method === 'set') {
                data["cmi.core.lesson_status"] = st;
                return data["cmi.core.lesson_status"];
              }
            },
            save: function() {
              return "No error";
            },
          };
        })();
      `;
      console.log(window.API);
      script.async = false;
      setSCORM(window.API);
      document.body.appendChild(script);
    } else {
      setSCORM(SCORM_API);
    }
  }, []);

  return { SCORM, debug };
};
export default useSCORMPackage;
