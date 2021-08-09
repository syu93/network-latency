/**
 * Check network latency
 * @author Syu93
 */

/**
 * Handle check latency result.
 * @callback CheckLatencyCallback
 * @param {Number} avg The average response time
 */
/**
 * Abort checkConnectivity.
 * @callback AbortCheckConnectivity
 */

const image = new Image();
let tStart = null;
let tEnd = null;
let abortFallback = false;
let counter = 0;
let responseTimeArray = [];

const NO_RESPONSE_TIME = 100000;

/**
 * Check connectivity latency by loading an image as a ping HTTP request against provided URL
 * 
 * @param {Object} config Configuration object
 * @param {string} config.url The URL of the ressource to ping
 * @param {Number} config.timeToCount The number of time to count for average
 * @param {Number} config.threshold The theashold limit of latency
 * @param {Number} config.interval The employee's department.
 * @returns {AbortCheckConnectivity} An abort method to cancle the ping intervals
 */
export default function checkConnectivity({ url = 'https://www.google.com/images/phd/px.gif', timeToCount = 3, threshold = 2000, interval = 30000 } = {}) {
  // Check navigator onLine state to set the first connectivity status
  if (navigator.onLine) {
    changeConnectivity(true);
  } else {
    timeoutFallback(threshold);
  }

  // Listen for navigator online status change
  window.addEventListener('online', () => changeConnectivity(true));
  window.addEventListener('offline', () => timeoutFallback(threshold));


  // Call our check for connectivity latency workflow
  // We default fallback to offline
  // If the avarage ping response times is under the threshold
  // We abort the fallback to offline
  timeoutFallback(threshold);
  checkLatency(url, timeToCount, avg => handleResult(avg ,threshold));

  // Repeat the operaction
  const intervalRef = setInterval(() => {
    reset();
    timeoutFallback(threshold);
    checkLatency(url, timeToCount, avg => handleResult(avg ,threshold));
  }, interval);

  return function AbortCheckConnectivity() {
    clearInterval(intervalRef);
    reset();
  }
}

/**
 * Reset the responseTimeArray, the counter, and the abort flag
 */
function reset() {
  responseTimeArray = [];
  counter = 0;
  abortFallback = false;
}

/**
 * Handle the checkLatency result and compaare the average response time to the threshold
 * Use changeConnectivity to dispactch a connection changed event
 * @param {Number} avg The average response time
 * @param {Number} threshold The threshold limit 
 */
function handleResult(avg, threshold) {
  const isConnnectionFast = avg <= threshold;
  changeConnectivity(isConnnectionFast);
}

/**
 * Recursive function that load an image recursively a given number of time
 * To compute the average response time
 * @param {String} url The URL of the ressource to ping
 * @param {Number} timeToCount The number of time to count for average
 * @param {CheckLatencyCallback} cb A function to call after each ping cycle
 */
function checkLatency(url, timeToCount, cb) {
  tStart = Date.now();
  if (counter < timeToCount) {
    image.src = `${url}?t=${tStart}`;
    image.onload = function pingResult() {
      abortFallback = true;
      tEnd = Date.now();
      const time = tEnd - tStart;
      responseTimeArray.push(time);
      counter++;
      checkLatency(url, timeToCount, cb);
    }
    image.onerror = function erroPingResult() {
      abortFallback = true;
      responseTimeArray.push(NO_RESPONSE_TIME);
      counter++;
      checkLatency(url, timeToCount, cb);
    }
  } else {
    const sum = responseTimeArray.reduce((a, b) => a + b);
    const avg = sum / responseTimeArray.length;
    cb(avg);
  }
}

/**
 * Dispatch a custom event 'connection-change' that indicate if latency is above the threshold or not
 * @param {Boolean} state A boolean value that represent the state of the connectivity regarding the threshold
 */
function changeConnectivity(state) {
  const event = new CustomEvent('connection-changed', {
    detail: state
  });
  document.dispatchEvent(event);
}

/**
 * A fallcack handler the dispatch a connection change event that indicate that the latency is above the threshold
 * @param {Number} threshold A threshold limit to consider user offline
 */
function timeoutFallback(threshold) {
  setTimeout(() => {
    if (!abortFallback) {
      console.warn('Connectivity is too slow, falling back to offline mode');
      changeConnectivity(false);
    }
  }, threshold +1);
}
