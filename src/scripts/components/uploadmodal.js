 (() => {
   let UploadModalComponent = Vue.extend({
     name: 'uploadmodal',
     template: `
<transition name="modal">
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
      <!--
        <div class="modal-header modal-title">
          <slot name="header">Choose local file</slot>
        </div>
        -->
        <div class="modal-body">
          <file-upload className="my-file-uploader" name="myFile" id="myCustomId" action="upload.php" multiple></file-upload>
          <slot name="body">
          </slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button @click="closeModal" class="modal-default-button">Cancel</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</transition>`,
     methods: {
       filesUploaded: function (data, res) {
         this.$parent.filesUploaded(data, res);
       },
       uploadProgress: function (e) {
         var progress = document.getElementsByClassName('progress')[0];
         var dropZone = document.getElementsByClassName('fileContainer')[0];

         progress.style.display = 'block';
         dropZone.style.display = 'none';
         progress.setAttribute('data-progress', Math.floor(e.percent));
       },
       closeModal: function (е) {
         this.$emit('close');

         this.$children[0].abortUpload();
       },
     },
     data: function () {
       return {
         pasteDropImages: function (images) {
           this.$children[0].pasteDropImages(images);
         },
         modalBackdrop: function() {
           this.closeModal();
         }
       }
     }
   });
   Vue.component('uploadmodal', UploadModalComponent);
   //  console.log('init UploadModalComponent');
 })();