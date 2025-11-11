 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/service-worker.js b/service-worker.js
new file mode 100644
index 0000000000000000000000000000000000000000..b1460ce06c72a121df10e37df734a0a0067c212c
--- /dev/null
+++ b/service-worker.js
@@ -0,0 +1,48 @@
+const CACHE_NAME = 'pedidos-tienda-v1';
+const APP_SHELL = [
+  './',
+  './index.html',
+  './manifest.webmanifest',
+  './service-worker.js',
+  './icons/icon-192.png',
+  './icons/icon-512.png'
+];
+
+self.addEventListener('install', (event) => {
+  event.waitUntil(
+    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
+  );
+});
+
+self.addEventListener('activate', (event) => {
+  event.waitUntil(
+    caches.keys().then((keys) =>
+      Promise.all(
+        keys
+          .filter((key) => key !== CACHE_NAME)
+          .map((key) => caches.delete(key))
+      )
+    )
+  );
+});
+
+self.addEventListener('fetch', (event) => {
+  if (event.request.method !== 'GET') {
+    return;
+  }
+
+  event.respondWith(
+    caches.match(event.request).then((cachedResponse) => {
+      if (cachedResponse) {
+        return cachedResponse;
+      }
+      return fetch(event.request).then((response) => {
+        const clonedResponse = response.clone();
+        caches.open(CACHE_NAME).then((cache) => {
+          cache.put(event.request, clonedResponse);
+        });
+        return response;
+      }).catch(() => caches.match('./index.html'));
+    })
+  );
+});
 
EOF
)
