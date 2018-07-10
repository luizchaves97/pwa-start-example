# PWA with a 100% Lighthouse score!


This repository has a start example for you to have a PWA with a **100%** scoring on the Lighthouse.  To run the example, I recommend that you install the extension [web server for chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb).

The basic example is an application that adds notes. So when you clone the project, you'll see this:

![enter image description here](https://lh3.googleusercontent.com/VBfIYvlVGnmz74USu_XU7Xh-iAIcrf9HEBpqIZGi4YvTti_Yxq851tD-Z1_O2A5GzkFj96MLgeXf)

*Figure 1*. The basic example is an application that adds notes 

### To clone the project it's just:

    git clone https://github.com/luizchaves97/pwa-start-example.git

### Or [live demo](https://luizchaves97.github.io/pwa-start-example/).

## Web App Manifest

> The [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) is a simple JSON file that tells the browser about your web application and how it should behave when 'installed' on the users mobile device or desktop. - Google Developers

To learn more about Web App Manifest, [click here](https://developers.google.com/web/fundamentals/web-app-manifest/?hl=en).

In our example, the **manifest.json** looks like this:

    {
	  "name": "MyNotes",
	  "short_name": "Notes",
	  "icons": [
	    {
	      "src":"img/icons/icon-128x128.png",
	      "sizes": "128x128",
	      "type":"image/png"
	    },
	    {
	      "src":"img/icons/icon-144x144.png",
	      "sizes": "144x144",
	      "type":"image/png"
	    },
	    {
	      "src":"img/icons/icon-152x152.png",
	      "sizes": "152x152",
	      "type":"image/png"
	    },
	    {
	      "src":"img/icons/icon-192x192.png",
	      "sizes": "192x192",
	      "type":"image/png"
	    },
	    {
	      "src":"img/icons/icon-256x256.png",
	      "sizes": "256x256",
	      "type":"image/png"
	    },
	    {
	      "src":"img/icons/icon-512x512.png",
	      "sizes": "512x512",
	      "type":"image/png"
	    }
	  ],
	  "start_url": "/pwa-start-example/",
	  "display": "standalone",
	  "background_color": "#607d8b",
	  "theme_color": "#607d8b"
	}

## Service Worker

> A service worker is a script that your browser runs in the background, separate from a web page, opening the door to features that don't need a web page or user interaction. Today, they already include features like [push notifications](https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web) and [background sync](https://developers.google.com/web/updates/2015/12/background-sync). - Google Developer

To learn more about Service Worker, [click here](https://developers.google.com/web/fundamentals/primers/service-workers/). 

In our example, we start **serviceworker.js** by creating a variable that indicates the name and version of our cache.

    let cacheName = 'pwa-v.1.0.0';

Soon after we created two functions that will help us during the development of our service worker.

    function addToCache(cacheName, request, response) {
	  caches.open(cacheName)
	    .then(cache => { cache.put(request, response)});
	}

	function preCache() {
	    return caches.open(cacheName).then(cache => {
	        return cache.addAll([
	            '/',
	            'css/colors.css',
	            'css/style.css',
	            'js/array.observe.polyfill.js',
	            'js/object.observe.polyfill.js',
	            'js/scripts.js'
	        ]);
	    });
	}
**addToCache()** is the function to add the files in cache passing as a parameter the name of the cache, the request and the response of the file.
**preCache()** is the function that will cache some essential files in the installation of the service worker.

### Let's install...

    self.addEventListener('install', (e) => {
	    console.log('[ServiceWorker] Installer');
	    e.waitUntil(preCache());
	});
In the installation event, we print in console.log() and then use the function [waitUntil()](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil) to pre cache our main files.

### Let's activate...

    self.addEventListener('activate', (e) => {
	    console.log('[ServiceWorker] Activate');
	    e.waitUntil(
	        caches.keys().then( keyList => {
	            return Promise.all(keyList.map( key => {
	                if(key !== cacheName){
	                    console.log('[ServiceWorker] Removing old cache');
	                    return caches.delete(key);
	                }
	            }));
	        })
	    );
	});
In the installation event, we print in console.log() and then use the function waitUntil() to check if it already has some old cache. If it exists, we delete it.

### Let's fetch...

    self.addEventListener('fetch', (e) => {
		let request = e.request,
	      acceptHeader = request.headers.get('Accept');

	   if (acceptHeader.indexOf('text/html') !== -1) {
	   	e.respondWith(
	      	fetch(request)
	     		.then( response => {
	       		if (response.ok) 
	         		addToCache(cacheName, request, response.clone());
	       		return response;
	     		})
	   		.catch( () => {
	     			return caches.match(request).then( response => { 
	         		return response; 
	     			})
	   		})
	     );
	  	}else if (request.url.indexOf('localhost') !== -1 && (request.url.indexOf('.js') !== -1 || request.url.indexOf('.css') !== -1)) {
	    	e.respondWith(
	      	caches.match(request)
	     		.then( response => {
	     			let fetchPromise = fetch(e.request).then( networkResponse  => {
	     				addToCache(cacheName, request, networkResponse.clone());
		          	return networkResponse;
		        	})
	          	return response || fetchPromise;
	   		})
	    	);
	  	}
	});

In the fetch event, we have two caching rules for different files that will be cached. For **HTML files**, we use the "Network then Cache" rule. For **CSS and JS files**, we use the "Cache then Network" rule. To understand better, [click here](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/).

### The service worker life cycle
To better understand the life cycle of a serviceworker, we have an image that illustrates this process.

![enter image description here](https://developers.google.com/web/fundamentals/primers/service-workers/images/sw-lifecycle.png)

*Figure 2*. The service worker life cycle (Last updated July 2, 2018)


## Results
After the development, an analysis was made by the [Lighthouse](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk) and we had the following results.
![enter image description here](https://lh3.googleusercontent.com/tqfrOwu4WB3_2v-Tx3KLV8k2NrdyPMUo7s0UPZcKniBs3R0QgPKPJLAE71ADG0ma45irGVUgZy6E)

*Figure 3*. The results of Lighthouse analysis.

The test was done on the Github server, to see a live demo, [click here](https://luizchaves97.github.io/pwa-start-example/).

## References

- https://developers.google.com/web/progressive-web-apps/
- https://developers.google.com/web/fundamentals/primers/service-workers/
- https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
- https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
- https://developer.mozilla.org/pt-BR/docs/Web/API/Service_Worker_API/Using_Service_Workers
- https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch
- https://blog.angular-university.io/service-workers/
- https://www.afasterweb.com/2017/01/31/upgrading-your-service-worker-cache/
