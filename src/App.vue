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

// Set CSS variable for actual viewport height
const setViewportHeight = () => {
  // Use visualViewport for accurate height when keyboard is shown
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${vh}px`)
}

onMounted(() => {
  // Use the same host but ttyd port
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  terminalUrl.value = `${protocol}//${hostname}:8021`
  
  // Set initial viewport height
  setViewportHeight()
  
  // Update on resize
  window.addEventListener('resize', setViewportHeight)
  
  // Use visualViewport for better mobile keyboard detection
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setViewportHeight)
    window.visualViewport.addEventListener('scroll', setViewportHeight)
  }
  
  // Prevent scrolling
  const preventScroll = (e) => {
    e.preventDefault()
    return false
  }
  
  document.addEventListener('touchmove', preventScroll, { passive: false })
  document.addEventListener('scroll', preventScroll, { passive: false })
  
  // Always stay at top
  window.scrollTo(0, 0)
})

onUnmounted(() => {
  window.removeEventListener('resize', setViewportHeight)
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', setViewportHeight)
    window.visualViewport.removeEventListener('scroll', setViewportHeight)
  }
})
</script>

<style scoped>
.terminal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  /* Use CSS variable that updates with visualViewport */
  height: var(--app-height, 100vh);
  background: #000;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
}

.terminal-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
  overflow: hidden;
  overscroll-behavior: none;
}

/* Safe area support */
@supports (padding: env(safe-area-inset-top)) {
  .terminal-container {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
</style>