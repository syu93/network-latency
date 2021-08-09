import checkConnectivity from './index.js';

class NetworkLatency extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({mode: 'open'});
    const template = document.createElement('template');
    template.innerHTML = `<style>:host { display: block; }</style><div class=".network-message" hidden><slot>Connectivity is to slow, falling back to offline mode</slot></div>`;
    shadowRoot.appendChild(template.content.cloneNode(true));

    this._url = null;
    this._timeToCount = null;
    this._threshold = null;
    this._interval = null;

    this._connectionStateFlag = true;

    this._properties = {
      'url': String,
      'timeToCount': Number,
      'threshold': Number,
      'interval': Number,
    };

    document.addEventListener('connection-changed', ({ detail }) => {
      const connectionChange = this._connectionStateFlag !== detail;

      if (!connectionChange) return;

      if (detail) {
        const event = new CustomEvent('online-mode');
        this.dispatchEvent(event, { detail });
      } else {
        const event = new CustomEvent('offline-mode');
        this.dispatchEvent(event, { detail });
      }

      this._connectionStateFlag = detail;
    });

    this.__abortCheckConnectivity = () => {};
    this.startCheckConnectivity = this._debounce(() => {
      this.__abortCheckConnectivity();
      this.__abortCheckConnectivity = checkConnectivity(this._getConfig());
    });
  }
  static get observedAttributes() {
    return [
      'url',
      'timeToCount',
      'threshold',
      'interval',
    ];
  }

  get url() {
    return this.getAttribute('url');
  }
  
  set url(newValue) {
    this.setAttribute('url', newValue);
  }

  get timeToCount() {
    return Number(this.getAttribute('timeToCount'));
  }
  
  set timeToCount(newValue) {
    this.setAttribute('timeToCount', newValue);
  }

  get threshold() {
    return Number(this.getAttribute('threshold'));
  }
  
  set threshold(newValue) {
    this.setAttribute('threshold', newValue);
  }

  get interval() {
    return Number(this.getAttribute('interval'));
  }
  
  set interval(newValue) {
    this.setAttribute('interval', newValue);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[`_${name}`] = oldValue !== newValue && this._properties[name]
      ? this._properties[name](newValue)
      : oldValue;

    this.startCheckConnectivity();
  }

  connectedCallback() {
    this.startCheckConnectivity();
  }

  _debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  _getConfig() {
    return {
      ...(this._url ? { url: this._url } : {}),
      ...(this._timeToCount ? { timeToCount: this._timeToCount } : {}),
      ...(this._threshold ? { threshold: this._threshold } : {}),
      ...(this._interval ? { interval: this._interval } : {}),
    };
  }
}

customElements.define('network-latency', NetworkLatency);
