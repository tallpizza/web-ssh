<template>
  <div class="terminal-container">
    <iframe 
      ref="terminalFrame"
      class="terminal-iframe"
      :src="terminalUrl"
      frameborder="0"
      scrolling="no"
      @load="onIframeLoad"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const terminalFrame = ref(null)
const terminalUrl = ref('')


const onIframeLoad = () => {
  // Try to inject mobile-friendly styles into the iframe
  try {
    if (terminalFrame.value && terminalFrame.value.contentWindow) {
      const iframeDoc = terminalFrame.value.contentDocument || terminalFrame.value.contentWindow.document
      
      // Inject mobile-optimized styles
      const style = iframeDoc.createElement('style')
      style.textContent = `
        * {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          overscroll-behavior: none !important;
          touch-action: manipulation !important;
        }
        
        #terminal {
          height: 100% !important;
          width: 100% !important;
        }
        
        .xterm-viewport {
          overflow: hidden !important;
          overscroll-behavior: none !important;
        }
        
        /* Adjust terminal font size for mobile */
        @media (max-width: 768px) {
          .xterm {
            font-size: 14px !important;
          }
        }
        
        /* Prevent zoom on input focus */
        input, textarea, select {
          font-size: 16px !important;
        }
      `
      iframeDoc.head.appendChild(style)
      
      // Prevent zoom on double-tap
      let lastTouchEnd = 0
      iframeDoc.addEventListener('touchend', function (event) {
        const now = Date.now()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      }, false)
    }
  } catch (e) {
    // Cross-origin restriction, can't modify iframe
    console.log('Cannot modify iframe content due to cross-origin restrictions')
  }
}

onMounted(() => {
  // Use the same host but ttyd port
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  terminalUrl.value = `${protocol}//${hostname}:8021`
  
  // Prevent pull-to-refresh on mobile
  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })
})
</script>

<style scoped>
.terminal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  overflow: hidden;
  /* Prevent bouncing and scrolling */
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  touch-action: none;
}

.terminal-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: #000;
  /* Prevent scrolling within iframe */
  overflow: hidden;
  overscroll-behavior: none;
}

/* Safe area support - apply to iframe instead of container */
@supports (padding: env(safe-area-inset-top)) {
  .terminal-iframe {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
</style>