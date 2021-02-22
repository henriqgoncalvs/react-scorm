// mock SCORM API for development
window.API = (function(){
  var data = {
    "cmi.core.student_id": "000010",
    "cmi.core.student_name": "Doe, Henry",
    "cmi.core.lesson_location": "0",
    "cmi.core.lesson_status": "not attempted",
    "cmi.suspend_data": ""
  };
  return {
    LMSInitialize: function() {
      return "true";
    },
    LMSCommit: function() {
      return "true";
    },
    LMSFinish: function() {
      return "true";
    },
    LMSGetValue: function(model) {
      return data[model] || "";
    },
    LMSSetValue: function(model, value) {
      data[model] = value;
      return "true";
    },
    LMSGetLastError: function() {
      return "0";
    },
    LMSGetErrorString: function() {
      return "No error";
    },
    LMSGetDiagnostic: function() {
      return "No error";
    }
  };
})();
