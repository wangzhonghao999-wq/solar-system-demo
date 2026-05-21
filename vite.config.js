import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [{ find: /^three$/, replacement: 'three/src/Three.js' }]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/examples/jsm/controls/')) return 'three-controls';
          if (id.includes('/node_modules/three/src/renderers/')) return 'three-renderer';
          if (id.includes('/node_modules/three/src/materials/') || id.includes('/node_modules/three/src/renderers/shaders/')) return 'three-materials';
          if (id.includes('/node_modules/three/src/geometries/') || id.includes('/node_modules/three/src/objects/')) return 'three-scene-objects';
          if (id.includes('/node_modules/three/src/')) return 'three-core';
        }
      }
    }
  }
});
