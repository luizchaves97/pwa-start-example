let cacheName = 'notes-son-v.1.0.0';

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Installer');
    e.waitUntil(preCache());
});

function preCache() {
    return caches.open(cacheName).then(function (cache) {
        return cache.addAll([
            '/',
            'css/colors.css',
            'css/style.css',
            'js/scripts.js'
        ]);
    });
}

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if(key !== cacheName){
                    console.log('[ServiceWorker] Removing old cache');
                    return caches.delete(key);
                }
            }));
        })
    );
});

function addToCache(cacheName, request, response) {
  caches.open(cacheName)
    .then(function(cache){ cache.put(request, response)});
}

self.addEventListener('fetch', function(e) {
	var request = e.request,
      acceptHeader = request.headers.get('Accept');

   if (acceptHeader.indexOf('text/html') !== -1) {
   	e.respondWith(
      	fetch(request)
     		.then(function(response){
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
     		.then(function(response){ 
     			var fetchPromise = fetch(e.request).then(function(networkResponse) {
     				addToCache(cacheName, request, networkResponse.clone());
	          	return networkResponse;
	        	})
          	return response || fetchPromise;
   		})
    	);
  	}
});