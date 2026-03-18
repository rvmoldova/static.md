/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'masonry-layout';
declare module 'imagesloaded';

interface Window {
  ga?: (...args: any[]) => void;
}
