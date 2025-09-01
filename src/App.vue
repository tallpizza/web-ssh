<template>
  <div class="terminal-container" :style="containerStyle">
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
import { ref, onMounted, onUnmounted, computed } from 'vue'

const terminalFrame = ref(null)
const terminalUrl = ref('')
const viewportHeight = ref(window.innerHeight)

// Dynamically calculate container height based on actual viewport
const containerStyle = computed(() => ({
  height: `${viewportHeight.value}px`
}))


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

// Update viewport height on resize
const updateViewportHeight = () => {
  viewportHeight.value = window.innerHeight
}

onMounted(() => {
  // Use the same host but ttyd port
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  terminalUrl.value = `${protocol}//${hostname}:8021`
  
  // Track viewport changes
  window.addEventListener('resize', updateViewportHeight)
  
  // Use visualViewport for more accurate mobile keyboard detection
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      viewportHeight.value = window.visualViewport.height
    })
  }
  
  // Prevent ALL scrolling and touch movement
  const preventScroll = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
  
  // Block all scroll-related events
  document.addEventListener('touchmove', preventScroll, { passive: false })
  document.addEventListener('scroll', preventScroll, { passive: false })
  window.addEventListener('scroll', preventScroll, { passive: false })
  
  // Lock scroll position
  window.scrollTo(0, 0)
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewportHeight)
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', updateViewportHeight)
  }
})
</script>

<style scoped>
.terminal-container {
  position: fixed;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  /* Height is set dynamically via style prop */
  background: #000;
  overflow: hidden !important;
  /* Prevent bouncing and scrolling */
  overscroll-behavior: none !important;
  overscroll-behavior-y: none !important;
  -webkit-overflow-scrolling: none !important;
  touch-action: none !important;
  transform: translate3d(0, 0, 0); /* Force GPU acceleration */
}

.terminal-iframe {
  position: absolute;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  /* Fill parent container height */
  height: 100% !important;
  border: none;
  display: block;
  background: #000;
  /* Prevent scrolling within iframe */
  overflow: hidden !important;
  overscroll-behavior: none !important;
  pointer-events: auto;
  transform: translate3d(0, 0, 0); /* Force GPU acceleration */
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