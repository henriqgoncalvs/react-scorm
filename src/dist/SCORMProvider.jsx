import { createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import useSCORMPackage from 'hooks/use-SCORM-package';

const SCORMContext = createContext({
  SCORM: undefined,
});

const SCORMProvider = ({ version, debug: debugProp, children }) => {
  const { SCORM, debug } = useSCORMPackage();
  const [apiConnected, setApiConnected] = useState(false);
  const [learnerName, setLearnerName] = useState('');
  const [completionStatus, setCompletionStatus] = useState('unknown');
  const [scormVersion, setScormVersion] = useState('');

  const createScormAPIConnection = () => {
    if (apiConnected) return;

    if (version) SCORM.version = version;
    if (typeof debugProp === "boolean") debug.isActive = debugProp;
    const scorm = SCORM.init();
    if (scorm) {
      const version = SCORM.version;
      const learnerName = version === '1.2' ? SCORM.get('cmi.core.student_name') : SCORM.get('cmi.learner_name');
      const completionStatus = SCORM.status('get');
      setApiConnected(true);
      setLearnerName(learnerName);
      setCompletionStatus(completionStatus);
      setScormVersion(version);
    } else {
      // could not create the SCORM API connection
      if (debugProp) console.error("ScormProvider init error: could not create the SCORM API connection");
    }
  };

  const closeScormAPIConnection = () => {
    if (!apiConnected) return;

    setSuspendData();
    SCORM.status('set', completionStatus);
    SCORM.save();
    const success = SCORM.quit();
    if (success) {
      setApiConnected(false);
      setLearnerName('');
      setCompletionStatus('unknown');
      setSuspendData({});
      setScormVersion('');
    } else {
      // could not close the SCORM API connection
      if (debugProp) console.error("ScormProvider error: could not close the API connection");
    }
  }

  const setStatus = (status) => {
    if (!apiConnected) throw new Error('SCORM API not connected');

    const validStatuses = ["passed", "completed", "failed", "incomplete", "browsed", "not attempted", "unknown"];
    if (!validStatuses.includes(status)) {
      if (debugProp) console.error("ScormProvider setStatus error: could not set the status provided");
      throw new Error('could not set the status provided');
    }

    const success = SCORM.status("set", status);
    if (!success) throw new Error('could not set the status provided');
    setCompletionStatus(status)
  }

  const set = (param, val) => {
    if (!apiConnected) throw new Error('SCORM API not connected');

    const success = SCORM.set(param, val);
    if (!success) throw new Error(`could not set: { ${param}: ${val} }`);
    SCORM.save();
    return `${param}: ${val}`;
  };

  const get = (param) => {
    if (!apiConnected) return;
    return SCORM.get(param);
  };

  const setScore = (scoreObj) => {
    if (!apiConnected) throw new Error('SCORM API not connected');

    const { value, min, max, status } = scoreObj;
    const coreStr = scormVersion === '1.2' ? '.core' : ''
    const promiseArr = [];
    if (typeof value === 'number') promiseArr.push(set(`cmi${coreStr}.score.raw`, value, true));
    if (typeof min === 'number') promiseArr.push(set(`cmi${coreStr}.score.min`, min, true));
    if (typeof max === 'number') promiseArr.push(set(`cmi${coreStr}.score.max`, max, true));
    if (typeof status === 'string') promiseArr.push(setStatus(status, true));

    Promise.all(promiseArr)
      .then(() => {
        SCORM.save();
        return;
      })
      .catch(() => {
        throw new Error('could not save the score object provided');
      });
  }

  useEffect(() => {
    createScormAPIConnection();
    window.addEventListener("beforeunload", () => closeScormAPIConnection());
  }, [SCORM]);

  const val = {
    apiConnected,
    learnerName,
    completionStatus,
    scormVersion,
    setStatus,
    setScore,
    set,
    get
  }

  return (
    <SCORMContext.Provider value={val}>
      {children}
    </SCORMContext.Provider>
  );
};

SCORMProvider.propTypes = {
  version: PropTypes.oneOf(['1.2', '2004']),
  debug: PropTypes.bool,
}

export default SCORMProvider;
export const useSCORMContext = () => useContext(SCORMContext);
