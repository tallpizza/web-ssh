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
  
  // Prevent ALL scrolling
  const preventAllScrolling = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
  
  // Block every possible scroll event
  ['scroll', 'touchmove', 'wheel', 'touchstart'].forEach(event => {
    document.addEventListener(event, preventAllScrolling, { passive: false, capture: true })
    window.addEventListener(event, preventAllScrolling, { passive: false, capture: true })
    document.body.addEventListener(event, preventAllScrolling, { passive: false, capture: true })
  })
  
  // Force position to 0,0
  const lockPosition = () => {
    window.scrollTo(0, 0)
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
    if (window.visualViewport) {
      window.scrollTo(0, -window.visualViewport.offsetTop)
    }
  }
  
  // Lock on any event that might cause scroll
  window.addEventListener('resize', lockPosition)
  window.addEventListener('orientationchange', lockPosition)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', lockPosition)
    window.visualViewport.addEventListener('scroll', lockPosition)
  }
  
  // Initial lock
  lockPosition()
  
  // Aggressive position locking
  setInterval(lockPosition, 100)
})
</script>

<style scoped>
.terminal-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  background: #000;
  overflow: hidden !important;
  overscroll-behavior: none !important;
  overscroll-behavior-y: none !important;
  overscroll-behavior-x: none !important;
  touch-action: none !important;
  -webkit-overflow-scrolling: none !important;
  transform: translate3d(0,0,0);
  z-index: 9999;
}

.terminal-iframe {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border: none;
  background: #000;
  overflow: hidden !important;
  overscroll-behavior: none !important;
  transform: translate3d(0,0,0);
  z-index: 10000;
}

/* Safe area support */
@supports (padding: env(safe-area-inset-top)) {
  .terminal-iframe {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
</style>