$(document).ready(() => {
	let uploadOv = document.createElement('div');
	let uploadOvZ = document.createElement('div');
	let uploadOvH1 = document.createElement('h1');
	uploadOv.classList.add('upload-overlay');
	uploadOvZ.classList.add('upload-overlay-zone');
	uploadOvH1.textContent = 'Drop Here';
	uploadOvZ.appendChild(uploadOvH1);
	uploadOv.appendChild(uploadOvZ);
	document.body.appendChild(uploadOv);
	// Promise polyfill
	if (!window.Promise)
		window.Promise = Promise;

	let galleryIdGl;

	i18next.init({
		lng: 'en',
		resources: {
			en: {
				translation: {
					nav: {
						'home': 'Home',
						'gallery': 'Gallery',
						'contact': 'Contact',
						'API': 'API',
						'upload': 'Upload',
						'privacypolicy': 'Terms & Privacy Policy'
					},
					home: {
						'hello': 'Hello',
						'description': 'Free image hosting',
					}
				}
			}
		}
	}, (err, t) => {
		// console.log(err, t);
		// console.log('i18n ready');
		jqueryI18next.init(i18next, $);
	});

	// Animate loaded content
	let waypoints = [];

	function showContent() {
		var header = document.getElementsByClassName('header')[0];
		var headline = document.getElementsByClassName('headline')[0];
		var footer = document.getElementsByClassName('footer')[0];
		var app = document.getElementById('app');

		// Reset animation classes so re-adding them triggers the animation again
		if (header) {
			header.classList.remove('animated', 'fadeIn');
			void header.offsetWidth; // force reflow
			header.classList.add('animated', 'fadeIn');
		}
		if (headline) {
			headline.classList.remove('animated', 'fadeInUp');
			void headline.offsetWidth;
			headline.classList.add('animated', 'fadeInUp');
		}
		if (footer) {
			footer.classList.remove('animated', 'fadeIn');
			void footer.offsetWidth;
			footer.classList.add('animated', 'fadeIn');
			footer.style.visibility = 'visible';
		}
		if (app) app.style.visibility = 'visible';

		let sections = document.getElementsByClassName('section');
		for (let i = 0; i < sections.length; i++) {
			waypoints[i] = new Waypoint({
				element: sections[i],
				offset: '100%',
				handler: () => {
					var name = sections[i].getElementsByClassName('section__name')[0];
					var list = sections[i].getElementsByClassName('section__list')[0];
					if (name) name.classList.add('animated', 'fadeInLeft');
					if (list) list.classList.add('animated', 'fadeInRight');
				}
			});
		}
		if ($.fn.localize) $('body').localize();
	}

	// Wait for the primary font to load
	let font = new FontFaceObserver('Titillium Web').load()
		.then(function () {
			// console.log('Font is available');
		}, function () {
			// console.log('Font is not available');
		});

	// Load and change page content
	function changePage(name) {
		// Hide old content
		return new Promise((resolve, reject) => {
			document.getElementsByClassName('footer')[0].style.visibility = 'hidden';
			document.getElementById('app').style.visibility = 'hidden';
			window.scrollTo(0, 0);

			// Change navigation active link
			let nav = document.getElementsByClassName('header__nav__link');
			for (let i = 0; i < nav.length; i++)
				nav[i].classList.remove('header__nav__link--active');
			let active = document.getElementById('nav_' + name);
			if (active)
				active.classList.add('header__nav__link--active');

			// Change page title
			let title = name.toLowerCase().replace(/\b[a-z]/g, function (letter) {
				return letter.toUpperCase();
			});
			document.title = title + ' | Static MD';

			// Send pageview to google analytics
			ga('set', {
				page: location.pathname,
				title: title
			});
			ga('send', 'pageview');

			// Destroy old waypoints
			for (let i = 0; i < waypoints.length; i++)
				waypoints[i].destroy();

			// Fetch new content
			let page = axios.get('/layout_' + name + '.html');

			// When both font and content are properly loaded, show the content
			Promise.all([font, page]).then(res => {
				document.documentElement.classList.add('fonts-loaded');
				document.getElementById('app').innerHTML = res[1].data;
				showContent();
				router.updatePageLinks();
			}).then(() => {
				resolve();
			}).catch(err => {
				console.error('changePage error:', err);
				// Restore visibility so the page isn't stuck hidden
				document.getElementById('app').style.visibility = 'visible';
				document.getElementsByClassName('footer')[0].style.visibility = 'visible';
				resolve();
			})
		})
	}

	// Initializes and opens PhotoSwipe
	function initPhotoSwipeFromDOM(gallerySelector) {
		// parse slide data (url, title, size ...) from DOM elements 
		// (children of gallerySelector)
		var parseThumbnailElements = function (el) {
			// use only the grid items with images, ignoring the .grid-sizer
			// and .gutter-sizer elements
			var thumbElements = Array.from(el.childNodes),
				numNodes = thumbElements.length,
				items = [],
				figureEl,
				linkEl,
				size,
				item;

			for (var i = 0; i < numNodes; i++) {
				figureEl = thumbElements[i]; // <figure> element

				// console.log('hhhhhhhhhhhhhhh', figureEl)
				// include only element nodes 
				if (figureEl.nodeType !== 1) {
					continue;
				}

				linkEl = figureEl.children[0]; // <a> element
				if (!linkEl)
					continue;
				size = linkEl.getAttribute('data-size').split('x');

				// create slide object
				item = {
					src: linkEl.getAttribute('href'),
					w: parseInt(size[0], 10),
					h: parseInt(size[1], 10)
				};

				if (figureEl.children.length > 1) {
					// <figcaption> content
					item.title = figureEl.children[1].innerHTML;
				}

				if (linkEl.children.length > 0) {
					// <img> thumbnail element, retrieving thumbnail url
					item.msrc = linkEl.children[0].getAttribute('src');
				}

				item.el = figureEl; // save link to element for getThumbBoundsFn
				items.push(item);
			}

			return items;
		};

		// find nearest parent element
		var closest = function closest(el, fn) {
			return el && (fn(el) ? el : closest(el.parentNode, fn));
		};

		// triggers when user clicks on thumbnail
		var onThumbnailsClick = function (e) {
			e = e || window.event;
			e.preventDefault ? e.preventDefault() : e.returnValue = false;

			var eTarget = e.target || e.srcElement;

			// find root element of slide
			var clickedListItem = closest(eTarget, function (el) {
				return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
			});

			if (!clickedListItem) {
				return;
			}
			// console.log(clickedListItem);
			// find index of clicked item by looping through all child nodes
			// alternatively, you may define index via data- attribute
			var clickedGallery = clickedListItem.parentNode,
				childNodes = clickedListItem.parentNode.childNodes,
				numChildNodes = childNodes.length,
				nodeIndex = 0,
				index;
			// console.log(clickedGallery);
			for (var i = 0; i < numChildNodes; i++) {
				if (childNodes[i].nodeType !== 1) {
					continue;
				}

				if (childNodes[i] === clickedListItem) {
					index = nodeIndex;
					break;
				}
				nodeIndex++;
			}
			// console.log(index - 2);
			if (index >= 0) {
				// open PhotoSwipe if valid index found
				// index -2 is used to ignore the .grid-sizer and .gutter-sizer elements
				openPhotoSwipe(index - 2, clickedGallery);
			}
			return false;
		};

		// parse picture index and gallery index from URL (#&pid=1&gid=2)
		var photoswipeParseHash = function () {
			var hash = window.location.hash.substring(1),
				params = {};

			if (hash.length < 5) {
				return params;
			}

			var vars = hash.split('&');
			for (var i = 0; i < vars.length; i++) {
				if (!vars[i]) {
					continue;
				}
				var pair = vars[i].split('=');
				if (pair.length < 2) {
					continue;
				}
				params[pair[0]] = pair[1];
			}

			if (params.gid) {
				params.gid = parseInt(params.gid, 10);
			}

			return params;
		};

		var openPhotoSwipe = function (index, galleryElement, disableAnimation, fromURL) {
			var pswpElement = document.querySelectorAll('.pswp')[0],
				gallery,
				options,
				items;

			items = parseThumbnailElements(galleryElement);

			// define options (if needed)
			options = {

				// define gallery index (for URL)
				galleryUID: galleryElement.getAttribute('data-pswp-uid'),

				getThumbBoundsFn: function (index) {
					// See Options -> getThumbBoundsFn section of documentation for more info
					var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
						pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
						rect = thumbnail.getBoundingClientRect();

					return {
						x: rect.left,
						y: rect.top + pageYScroll,
						w: rect.width
					};
				},
				zoomEl: true,
				preloaderEl: true
			};

			// PhotoSwipe opened from URL
			if (fromURL) {
				if (options.galleryPIDs) {
					// parse real index when custom PIDs are used 
					// http://photoswipe.com/documentation/faq.html#custom-pid-in-url
					for (var j = 0; j < items.length; j++) {
						if (items[j].pid == index) {
							options.index = j;
							break;
						}
					}
				} else {
					// in URL indexes start from 1
					options.index = parseInt(index, 10) - 1;
				}
			} else {
				options.index = parseInt(index, 10);
				// console.log(options.index);
			}

			// exit if index not found
			if (isNaN(options.index)) {
				return;
			}

			if (disableAnimation) {
				options.showAnimationDuration = 0;
			}
			// console.log(items);
			// Pass data to PhotoSwipe and initialize it
			gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
			gallery.init();
		};

		// loop through all gallery elements and bind events
		var galleryElements = document.querySelectorAll(gallerySelector);

		for (var i = 0, l = galleryElements.length; i < l; i++) {
			galleryElements[i].setAttribute('data-pswp-uid', i + 1);
			galleryElements[i].onclick = onThumbnailsClick;
		}

		// Parse URL and open gallery if it contains #&pid=3&gid=1
		var hashData = photoswipeParseHash();
		if (hashData.pid && hashData.gid) {
			openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
		}
	}

	function handleEmbedMenu(imagesList) {
		var $modal = $('#embedModal');

		// Get the button that opens the modal
		var $btn = $("#embedModalTrigger");

		// Get the <span> element that closes the modal
		var $close = $(".close");

		var $embedBtns = $('.embed-btn');
		var $inputs = $('.input-field input');
		var $copyTrigger = $('.copy-trigger');
		// var link = window.location.href;
		var link = `${window.location.host}/${galleryIdGl}`;

		var htmlCode = '';
		var bbCode = ``;
		var linksCode = '';

		for (var i = 0; i < imagesList.length; i++) {
			htmlCode += `<a href="${imagesList[i].url}"><img src="${imagesList[i].url}" border="0" />static.md</a>\n`;
			bbCode += `[url=${imagesList[i].url}][img]${imagesList[i].url}[/img][/url]\n`;
			linksCode += imagesList[i].url + '\n';
		};

		embedForm.embedCode.value = htmlCode;

		// When the user clicks the button, open the modal 
		$btn.on('click', (e) => {
			$modal.css('display', 'block');
			embedForm.embedLink.value = link;
		});

		// When the user clicks on close the modal
		$close.on('click', () => {
			$modal.css('display', 'none');
		});

		$($embedBtns).on('click', function (e) {
			$($embedBtns).removeClass('selected');
			$(this).addClass('selected');

			if ($(e.target).hasClass('embedHTML')) {
				embedForm.embedCode.value = htmlCode;
			} else if ($(e.target).hasClass('embedBB')) {
				embedForm.embedCode.value = bbCode;
			} else if ($(e.target).hasClass('embedLinks')) {
				embedForm.embedCode.value = linksCode;
			};
		});

		$($inputs).on('click', function (e) {
			var $tooltip = $(this).next('.tooltip');
			$(this).select();
			document.execCommand('copy');
			$tooltip.addClass('visible');
			setTimeout(() => {
				$tooltip.removeClass('visible');
			}, 1500);
		});

		$($copyTrigger).on('click', function (e) {
			$(embedForm.embedCode).select();
			var $tooltip = $(embedForm.embedCode).next('.tooltip');
			document.execCommand('copy');
			$tooltip.addClass('visible');
			setTimeout(() => {
				$tooltip.removeClass('visible');
			}, 1500);
		});

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function (e) {
			if ($(e.target).hasClass('modal')) {
				$modal.css('display', 'none');
			};
		};
	};

	function initMasonryScrollReveal(elem, gridItems) {
		var totalItems = gridItems.length;
		var msnry = new Masonry(elem, {
			// Masonry grid options
			itemSelector: '.grid-item',
			columnWidth: '.grid-sizer',
			percentPosition: true,
			gutter: '.gutter-sizer',
			horizontalOrder: true,
			transitionDuration: '0.2s'
		});

		if (totalItems < 3) {
			var styleTemplate = `
			<style>
				.grid-sizer, .grid-item {
					width: 100%;
				}
				@media (min-width: 500px) {
					.grid-sizer, .grid-item {
						width: ${100 / totalItems}%;
					}
				}
			</style>
			`;

			$('.content-section').append(styleTemplate);
		};

		window.sr = ScrollReveal({
			// reset: true,
			useDelay: 'onload',
			viewport: document.getElementById('#grid'),
		});
		sr.reveal('.grid-item');

		imagesLoaded(elem).on('progress', function (instance, image) {
			// layout Masonry after images load one-by-one
			msnry.layout();
		});
	};

	function showToast($toast) {
		$toast.addClass('show');
		setTimeout(function () {
			$toast.removeClass('show');
		}, 3000);
	};

	// Navigo router
	window.router = new Navigo(location.protocol + '//' + location.host, false);
	window.router.notFound(() => {
			// console.log('change to 404');
			router.navigate('/g/bLu2Kv');
		})
		.on({
			'/contact': () => {
				// console.log('change to contact');
				changePage('contact');
			},
			'/privacy': () => {
				// console.log('change to privacy');
				changePage('privacy');
			},
			'/404': () => {
				// console.log('change to 404');
				changePage('404');
			},
			'/g/:galleryId': (params) => {
				// console.log('change to gallery');
				// console.log(params);
				galleryIdGl = params.galleryId;
				changePage('gallery')
					.then(() => {
						var elem = document.getElementById('grid');

						var newPics = '';
						var requestGallery = $.ajax({
							type: 'GET',
							url: `/api/v4/g/${params.galleryId}`,
							dataType: 'json'
						});

						requestGallery
							.done((galleryData) => {
								galleryData.links.forEach((image) => {
									newPics += `
								<figure class="grid-item" itemprop="associatedMedia" itemscope="itemscope" itemtype="http://schema.org/ImageObject" id="outer-box">
									<a href="${image.url}" itemprop="contentUrl" data-size="${image.size.w}x${image.size.h}">
									<img src="${image.url}" itemprop="thumbnail" alt="Image description"/>
									<div id="inner-box">
										<p class="center-icon"><i class="fa fa-search fa-lg"></i></p>
										<p class="bottom-icon share-link-trigger"><i class="fa fa-share-alt"></i></p>
										<div class="share-link-wrapper">
											<input type="text" class="img-share-link" value="${image.url}" readonly="true"/>
										</div>
									</div>
									</a>
									<!-- <figcaption itemprop="caption description"></figcaption> -->
								</figure>`;
								});

								handleEmbedMenu(galleryData.links);
								return galleryData.links;
							})
							.then((galleryLinks) => {
								elem.innerHTML += newPics;

								initMasonryScrollReveal(elem, galleryLinks.links);

								// initialize PhotoSwipe using existing images
								initPhotoSwipeFromDOM('.grid-gallery');


								var $shareLinkTrigger = $('.share-link-trigger');
								$shareLinkTrigger.on('click', function (e) {
									var $linkWrapper = $(this).next('.share-link-wrapper');
									e.preventDefault();

									$linkWrapper.find('.img-share-link').on('blur', function () {
										$shareLinkTrigger.next().removeClass('visible');
									});

									$linkWrapper.toggleClass('visible');

									$linkWrapper.find('.img-share-link').focus().select();
									document.execCommand('copy');

									showToast($('#toast'));

									return false;
								});
							})
							.fail((error) => {
								// console.log(error);
								if (error.status == 404) {
									window.router.navigate('404');
								}
							});
					});
			}
		})
		.on(() => {
			// console.log('change to home');
			changePage('home');
		})
		.resolve();
});