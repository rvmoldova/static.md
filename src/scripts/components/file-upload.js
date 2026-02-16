(() => {
    var FileUploadComponent = Vue.extend({
        name: 'file-upload',
        template: `
<div v-bind:class="className">
    <label class="fileContainer" @dragover.prevent @drop="_onDropFiles">
        <div><i class="fa fa-cloud-upload fa-3x"></i></div>
        <span>Select files or drop them over to upload</span><br/><span>Or press CTRL+V</span>
        <input type="file" v-bind:name="name" v-bind:id="id || name" v-bind:accept="accept" v-on:click="fileInputClick" v-on:change="fileInputChange" v-bind:multiple="multiple">
        <slot></slot>
    </label>
        <div class="progress" data-progress="0">
            <div class="progress_mask isFull">
                <div class="progress_fill"></div>
            </div>
            <div class="progress_mask">
                <div class="progress_fill"></div>
            </div>
        </div>
    </div>
</div>
        `,
        props: {
            className: String,
            name: {
                type: String,
                required: true
            },
            id: String,
            action: {
                type: String,
                required: true
            },
            accept: String,
            multiple: String,
            headers: Object,
            method: String,
            buttonText: {
                type: String,
                default: 'Upload'
            },
            // xhr: null
        },
        data: function () {
            return {
                myFiles: [],
                xhr: null
            };
        },
        methods: {
            fileInputClick: function () {
                // console.log('fileInputClick');
                this.$emit('onFileClick', this.myFiles);
            },
            fileInputChange: function () {
                // console.log('fileInputChange');
                var ident = this.id || this.name
                this.myFiles = document.getElementById(ident).files;
                this.$emit('onFileChange', this.myFiles);
                // console.log(this.myFiles);
                this.fileUpload();
            },
            _onProgress: function (e) {
                e.percent = (e.loaded / e.total) * 100;
                this.$emit('onFileProgress', e);
                // console.log('onFileProgress', e);
                this.$parent.uploadProgress(e);
            },
            _handleUpload: function (files) {
                this.$emit('beforeFileUpload', files);
                var form = new FormData();
                this.xhr = new XMLHttpRequest();
                form.append('token', 'carocetoken');
                for (let i in files) {
                    try {
                        // form.append('Content-Type', files.type || 'application/octet-stream');
                        form.append('file', files[i]);
                    } catch (err) {
                        this.$emit('onFileError', files, err);
                        return;
                    }
                }
                let that = this;
                return new Promise(function (resolve, reject) {

                    that.xhr.upload.addEventListener('progress', this._onProgress, false);

                    that.xhr.onreadystatechange = function () {
                        if (that.xhr.readyState < 4) {
                            return;
                        }
                        if (that.xhr.status < 400) {
                            var res = JSON.parse(that.xhr.responseText);
                            this.$parent.filesUploaded(files, res);
                            resolve(files);
                        } else {
                            var err = JSON.parse(that.xhr.responseText);
                            err.status = that.xhr.status;
                            err.statusText = that.xhr.statusText;
                            this.$emit('onFileError', files, err);
                            reject(err);
                        }
                    }.bind(this);

                    that.xhr.onerror = function () {
                        var err = JSON.parse(that.xhr.responseText);
                        err.status = that.xhr.status;
                        err.statusText = that.xhr.statusText;
                        this.$emit('onFileError', files, err);
                        reject(err);
                    }.bind(this);

                    that.xhr.open("POST", '/api/v4/upload', true);
                    that.xhr.send(form);
                    this.$emit('afterFileUpload', files);
                }.bind(this));
            },
            fileUpload: function () {
                if (this.myFiles.length > 0) {
                    return this._handleUpload(this.myFiles)
                        .then(function (allFiles) {}.bind(this)).catch(function (err) {
                            this.$emit('onFileError', this.myFiles, err);
                        }.bind(this));
                } else {
                    var err = new Error("No files to upload for this field");
                    this.$emit('onFileError', this.myFiles, err);
                }
            },
            _onDropFiles: function (e) {
                e.stopPropagation();
                e.preventDefault();
                this.myFiles = e.dataTransfer.files;
                this.fileUpload();
            },
            abortUpload: function () {
                if (this.xhr) {
                    this.xhr.abort();
                };
            },
            pasteDropImages: function (images) {
                this.myFiles = images;
                this.fileUpload();
            }
        }
    });

    Vue.component('file-upload', FileUploadComponent);
    // console.log('init FileUploadComponent');
})();