$(document).ready(() => {
    window.initApp = () => {
        var uploadApp = new Vue({
            el: '#uploadApp',
            data: {
                showModal: false,
                pasteDropImages: function (images) {
                    setTimeout(() => {
                        this.$children[0].pasteDropImages(images);
                    }, 100);
                }
            },
            methods: {
                filesUploaded: (data, res) => {
                    window.router.navigate('/g/' + res.gallery);
                    headerApp.toggleModal(new Event(null));
                }
            }
        });
        var headerApp = new Vue({
            el: '#headerApp',
            data: {
                toggleModal: (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    uploadApp.showModal = !uploadApp.showModal;
                    if (!uploadApp.showModal) {
                        uploadApp.$children[0].modalBackdrop();
                    };
                }
            }
        });
        // console.log('vue init');
        // console.log('uploadApp', uploadApp);
        // console.log('headerApp', headerApp);
        document.addEventListener('paste', (e) => {
            for (var i = 0; i < e.clipboardData.items.length; i++) {
                var item = e.clipboardData.items[i];
                if (item.type.indexOf('image') != -1) {
                    uploadApp.showModal = true;
                    uploadApp.pasteDropImages([item.getAsFile()]);
                } else {
                    console.log('Discarding image paste data. Not an image.');
                };
            };
        });

        var uploadLink = document.querySelector('.upload-overlay');
        var withinEnter = false;

        document.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();

            setTimeout(function () {
                uploadLink.classList.add('show');
                uploadApp.showModal = false;
            }, 0);
        });

        // Prevent browser's default behaviour
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.body.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadLink.classList.remove('show');
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ga('send', 'event', 'Homepage', 'Drop');
            document.querySelector('.upload-overlay').classList.remove('show');

            // If dropped items aren't files, reject them
            var dt = e.dataTransfer;
            var files = [];
            if (dt.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (var i = 0; i < dt.items.length; i++) {
                    if (dt.items[i].kind == 'file') {
                        var file = dt.items[i].getAsFile();
                        files.push(file);
                    };
                };
            } else {
                // Use DataTransfer interface to access the file(s)
                for (var i = 0; i < dt.files.length; i++) {
                    var file = dt.files[i];
                    files.push(file);
                };
            };

            uploadApp.showModal = true;
            uploadApp.pasteDropImages(files);
        });
        // Cleanup drag items
        document.addEventListener('dragend', (e) => {
            document.querySelector('.upload-overlay').classList.remove('show');
            // console.log('dragend');
            var dt = e.dataTransfer;
            if (dt.items) {
                // Use DataTransferItemList interface to remove the drag data
                for (var i = 0; i < dt.items.length; i++) {
                    dt.items.remove(i);
                };
            } else {
                // Use DataTransfer interface to remove the drag data
                e.dataTransfer.clearData();
            };

            uploadLink.classList.remove('upload-fancy');
        });

        // When the user clicks anywhere outside of the modal, close it
		window.onclick = function (e) {
			if ($(e.target).hasClass('modal-wrapper')) {
                headerApp.toggleModal(new Event(null));
			};
		};
    };
    window.initApp();
});