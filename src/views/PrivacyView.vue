<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'

const pageRef = ref(null)
useReveal(pageRef, { selector: '.reveal', animationClass: 'animate-fade-in-up', stagger: false })
</script>

<template>
  <div ref="pageRef" class="privacy">
    <section class="hero" aria-label="Terms and Privacy Policy heading">
      <h1 class="reveal headline">Terms &amp; Privacy Policy</h1>
    </section>

    <div class="prose reveal">
      <h2>1. The Service</h2>
      <p>STATIC.MD is a free image hosting service intended for personal use. By using the service, you agree to these terms. If you do not agree, do not use the service.</p>
      <p>The service is provided free of charge, as is, with no guarantees of availability, uptime, or permanence. STATIC.MD may discontinue the service or any part of it at any time without notice.</p>

      <h2>2. Acceptable Use</h2>
      <p>You may use STATIC.MD to upload and share images for personal, non-commercial purposes. You agree not to:</p>
      <p>- Upload illegal content, including but not limited to child exploitation material, content that violates applicable laws, or content that infringes on the rights of others.</p>
      <p>- Use the service to distribute malware, spam, or phishing content.</p>
      <p>- Abuse, exploit, or overload the service in a way that degrades it for other users.</p>
      <p>- Use the service as a CDN or for bulk automated uploads without prior permission.</p>

      <h2>3. Your Content</h2>
      <p>You retain ownership of the images you upload. By uploading content, you represent that you have the right to do so and that it does not infringe on anyone else's rights.</p>
      <p>You grant STATIC.MD a non-exclusive, royalty-free license to store, serve, and display your uploaded content as necessary to operate the service. This license ends when your content is deleted from the service.</p>

      <h2>4. Content Moderation</h2>
      <p>STATIC.MD reserves the right to remove any uploaded content at any time and without prior notice, for any reason, including but not limited to copyright infringement, illegal content, or abuse of the service.</p>
      <p>STATIC.MD may block IP addresses associated with violations of these terms.</p>
      <p>Uploaded images are automatically analyzed using AI for content moderation purposes.</p>

      <h2>5. Disclaimer of Warranties</h2>
      <p>The service is provided on an "as is" and "as available" basis. STATIC.MD makes no warranties, expressed or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
      <p>STATIC.MD does not guarantee that uploaded content will remain available. You are responsible for keeping your own backups.</p>

      <h2>6. Limitation of Liability</h2>
      <p>In no event shall STATIC.MD be liable for any damages arising out of the use or inability to use the service, including but not limited to loss of data, loss of profit, or business interruption. Some jurisdictions do not allow these limitations, so they may not apply to you.</p>

      <h2>7. Copyright Infringement</h2>
      <p>If you believe that content on STATIC.MD infringes your copyright or other rights, please contact us at <a href="mailto:salut@static.md">salut@static.md</a>. We will review and act on legitimate requests promptly.</p>

      <h2>8. Modifications</h2>
      <p>STATIC.MD may update these terms at any time. Changes take effect immediately upon publication on this page. Continued use of the service constitutes acceptance of the updated terms.</p>

      <h2>9. Governing Law</h2>
      <p>These terms are governed by the laws of Moldova. Any disputes shall be subject to the exclusive jurisdiction of the courts of Moldova.</p>

      <h2>10. Open Source</h2>
      <p>The source code of STATIC.MD is publicly available. The open-source license applies to the code only, not to user-uploaded content or the service itself.</p>

      <hr />

      <h2>Privacy Policy</h2>
      <p><strong>Last updated: February 17, 2026</strong></p>
      <p>STATIC.MD is a free image hosting service intended for personal, non-commercial use. We collect only the minimum data necessary to operate the service and prevent misuse.</p>

      <h2>Data We Collect</h2>
      <p><strong>IP addresses.</strong> Your IP address is recorded when you upload an image. We store IP addresses solely to detect misuse, abuse, and exploitation of the service. IP addresses may be used to block users who violate these terms.</p>
      <p><strong>Uploaded file metadata.</strong> When you upload an image, we store its file name, file size, image dimensions, format, content hash (MD5), and the date of upload. This data is necessary to operate the hosting service and to deduplicate identical files.</p>
      <p><strong>Automated image analysis.</strong> Uploaded images are automatically analyzed using Google Cloud Vision AI to detect inappropriate content (such as adult or violent material) and to generate descriptive tags. This analysis is performed solely for content moderation purposes. No human review occurs unless flagged content requires manual action.</p>
      <p><strong>Analytics.</strong> We use Google Analytics to collect anonymous, aggregated usage data such as page views and general interaction patterns. Google Analytics may use cookies to distinguish unique visitors. No personally identifiable information is sent to Google Analytics. You can opt out of Google Analytics by using a browser extension or disabling cookies.</p>
      <p><strong>What we do NOT collect.</strong> We do not require registration or user accounts. We do not collect your name, email address, phone number, or any other personal contact information. We do not use advertising trackers or sell data to third parties.</p>

      <h2>How We Use Your Data</h2>
      <p>We use collected data for the following purposes:</p>
      <p>- To provide the image hosting service (storing and serving your uploads).</p>
      <p>- To detect and prevent misuse, abuse, or exploitation of the service.</p>
      <p>- To block access from IP addresses associated with violations.</p>
      <p>- To understand general usage patterns and improve the service.</p>

      <h2>Fair Use and Content Moderation</h2>
      <p>STATIC.MD assumes fair, personal use of the service. We reserve the right to delete any uploaded content at any time and without prior notice, particularly in cases of copyright infringement, illegal content, or abuse of the service. We may also block IP addresses associated with such violations.</p>

      <h2>Data Retention</h2>
      <p>Uploaded images and their associated metadata (including IP addresses) are retained for as long as the image remains hosted on the service. Temporary upload tokens expire automatically within seconds and are not retained.</p>

      <h2>Your Rights</h2>
      <p>If you wish to request the removal of an image you uploaded or the deletion of data associated with your uploads, please contact us at <a href="mailto:salut@static.md">salut@static.md</a>. We will process your request in accordance with applicable data protection laws.</p>

      <h2>Changes to This Policy</h2>
      <p>STATIC.MD may update this privacy policy from time to time. Changes take effect immediately upon publication on this page. Continued use of the service constitutes acceptance of the updated policy.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.privacy {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--content-padding);
  padding-bottom: var(--space-24);
}

.hero {
  margin-top: var(--space-16);
  margin-bottom: var(--space-12);
}

.prose {
  margin-top: var(--space-8);
}
</style>
