// Styles
import './styles/main.scss';

// Vendor libraries — assigned to window for compatibility with existing code
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import Vue from 'vue/dist/vue.esm.js';
window.Vue = Vue;

import Navigo from 'navigo';
window.Navigo = Navigo;

import axios from 'axios';
window.axios = axios;

import i18next from 'i18next';
window.i18next = i18next;

import jqueryI18next from 'jquery-i18next';
window.jqueryI18next = jqueryI18next;

import Masonry from 'masonry-layout';
window.Masonry = Masonry;

import imagesLoaded from 'imagesloaded';
window.imagesLoaded = imagesLoaded;

import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
window.PhotoSwipe = PhotoSwipe;
window.PhotoSwipeUI_Default = PhotoSwipeUI_Default;
import 'photoswipe/dist/photoswipe.css';
import 'photoswipe/dist/default-skin/default-skin.css';

import ScrollReveal from 'scrollreveal';
window.ScrollReveal = ScrollReveal;

import FontFaceObserver from 'fontfaceobserver';
window.FontFaceObserver = FontFaceObserver;

// Waypoints doesn't export — it attaches to window directly
import 'waypoints/lib/noframework.waypoints.min';

// Pace (loading indicator) - vendored, no npm package
import './scripts/pace.min.js';

// Font Awesome (CSS only, using local fonts)
import './styles/vendor-fa.css';

// App scripts loaded via dynamic import so that all window.* globals
// are assigned before the IIFEs in these files execute.
(async () => {
  await import('./scripts/components/file-upload.js');
  await import('./scripts/components/uploadmodal.js');
  await import('./scripts/vue_app.js');
  await import('./scripts/init.js');
})();
