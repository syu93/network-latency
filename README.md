# network-latency

A very small library to check network latency and dispatch event when it cross a threshold.

## Install

```bash
$ npm i network-latency
```

## How it work

The `checkConnectivity` method, is a simple utility method that calculate the network latency by loading a small image multiple times, and compute an average response time. If this response time is above the threshold, it fire a *connection-changed* event.

## Usage

### Library

```js
import checkConnectivity from 'network-latency';

// Call the checkConnectivity method
checkConnectivity({
  url: 'https://www.google.com/images/phd/px.gif',
  timeToCount: 3,
  threshold: 2000,
  interval: 30000 
});

// Add an event listener to listen on the 'connection-changed' event
document.addEventListener('connection-changed', ({ detail }) => {
  // ...
});

```

### Custom Element

**<network-latency></network-latency>**

```html
<!-- ... -->
<network-latency
  url="https://www.google.com/images/phd/px.gif"
  time-to-count="3"
  threshold="2000"
  interval="30000"
></network-latency>
<!-- ... -->
<script>
  const networkLatency = document.querySelector('network-latency');
  networkLatency.addEventListener('online-mode', () => {
    // ...
  });
  networkLatency.addEventListener('offline-mode', () => {
    // ...
  });
</script>

```

### API

#### Properties

**url**		`String`	= 	'*https://www.google.com/images/phd/px.gif*'

*The **url** property can be used to define the ressource on wich to do ping calls*

**time-to-count**		`Number`	= 	'*3*'

*The **time-to-count** property can be used to define the number of time to do the request in order to compute an average response time*

**threshold**		`Number`	= 	'*2000*'

*The **threshold** property can be used to define the max average response time to consider online*

**interval**		`Number`	= 	'*2000*'

*The **interval** property can be used to define the interval between ping cycles*

### Events

**online-mode**

*The online-mode event is fired when the average ping response time is under the threshold*

**offline-mode**

*The offline-mode event is fired when the average ping response time is above the threshold*
