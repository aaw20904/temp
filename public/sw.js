// service worker version number
const SW_VERSION = 9;
// the root name for our cache
const CACHE_ROOT = 'pwa-learn-cache';
// generates a custom cache name per service worker version
const CACHE_NAME = `${CACHE_ROOT}-v${SW_VERSION}`;



var urlList = [
  '/app.webmanifest',
   '/offline.js',
   '/offline.html',
  '/bootstrap.min.css',
  '/plane320.jpg',
  '/plane640.jpg',
  '/plane1280.jpg',
  '/mouse_320.jpg',
  '/mouse_640.jpg',
  '/mouse_1280.jpg',
  '/favicon.ico',
  '/index.js',
  '/sw.js'
];

//installing 

self.addEventListener('install', async (event)=>{
    console.log(`Worker ${event.type} fired!`);
 //// the service worker is installing, so it's our chance
  // to setup the app. In this case, we're telling   
  // the browser to wait until we've populated the cache
  // before considering this service worker installed
  //.waitUntil() expects a promise
  await event.waitUntil(prepareStaticCache());

})

async function prepareStaticCache() {
    //create a locale cache for the app
    try {
        let cache = await caches.open(CACHE_NAME);
        console.log('Workerr`s cache opened!');
        //download all the resources from te list
        return cache.addAll(urlList);
    }
    catch(err) {
        console.log(err);
        throw new Error(err);
    }
}

self.addEventListener('activate',(event)=>{
    //it`s a time to clean previous service workers from 
    console.log(`SW: ${event.type} event fired`);
    //remove old caches if exists
    event.waitUntil(removeOldCaches(event));
})

async function removeOldCaches(event){
    let cacheList = await caches.keys();
    return await Promise.all(
        cacheList.map(theCache=>{
            //is te cache key different than the 
            //current cache name and has the same root?
            if ((CACHE_NAME !== theCache) && (theCache.startsWith(CACHE_ROOT))) {
                //if yes - then delete it
                console.log(`ServiceWorker: delete cache ${theCache}`);
                return caches.delete(theCache); 
            }
        })
    );
}

self.addEventListener('fetch', event=>{
    console.log(`Worker: ${event.type} ${event.request.url}`);
    //is there index.html?
    if (event.request.url === `${location.origin}/`) {
        event.respondWith(indexFetching(event));
        return;
    }
    //is there an API request?
    if (event.request.url === `${location.origin}/api/random`) {
        event.respondWith(apiRoute(event));
        return;
    }
    //other cases
    event.respondWith(cachingStaticResources(event));

})


async function indexFetching(event) {
    let result;
    try{
        //if resurce avaliable - fetch and return to the browser
        result = await fetch(event.request);
        return result
    } catch (e) {
        //if the resource have not found - return 
        //the dummy content
       return caches.match('/offline.html');
        
    }
}

async function apiRoute(event) {
    let rsp;
    try {
        rsp = await fetch(event.request);
       
    } catch(e) {
        //if the resource have not found 404:
        console.log('ServiceWorker: catch-create a local API response')
        return new Response(JSON.stringify({current:{
                                                        rain:"maybe",
                                                        wind:"maybe",
                                                        snow:"maybe",
                                                        cloud:"maybe",
                                                        sunny:"maybe"
                                                    },
                                            location:{
                                                place:'offlie',
                                                country:'anywhere',
                                                city:'Detroit'
                                            }
    }),
        { "status": 200, });

    }
    return rsp;
}

async function cachingStaticResources (event) {
    let response = await caches.match(event.request);

    if (response) {
        console.log(`Worker From Cache: ${event.request.url}`);
        return response;
    } else {
        console.log(`Worker:  network request ${event.request.url}`);
        return fetch(event.request);
    }
}