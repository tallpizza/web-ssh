import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyboardHeight() {
  const keyboardHeight = ref(0)
  const isKeyboardOpen = ref(false)
  
  // Store initial viewport height
  let initialHeight = window.innerHeight
  
  const updateKeyboardHeight = () => {
    if (!window.visualViewport) {
      // Fallback for browsers without visualViewport
      const currentHeight = window.innerHeight
      const heightDiff = initialHeight - currentHeight
      
      if (heightDiff > 100) {
        keyboardHeight.value = heightDiff
        isKeyboardOpen.value = true
      } else {
        keyboardHeight.value = 0
        isKeyboardOpen.value = false
      }
      return
    }
    
    // Use visualViewport for accurate detection
    const windowHeight = window.innerHeight
    const viewportHeight = window.visualViewport.height
    const viewportTop = window.visualViewport.offsetTop || 0
    
    // Calculate keyboard height
    const kbHeight = windowHeight - viewportHeight - viewportTop
    
    // Threshold to detect if keyboard is actually open (not just browser UI)
    if (kbHeight > 100) {
      keyboardHeight.value = Math.round(kbHeight)
      isKeyboardOpen.value = true
    } else {
      keyboardHeight.value = 0
      isKeyboardOpen.value = false
    }
  }
  
  const handleViewportChange = () => {
    requestAnimationFrame(updateKeyboardHeight)
  }
  
  onMounted(() => {
    // Set initial height
    initialHeight = window.innerHeight
    
    // Listen to visualViewport events
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      window.visualViewport.addEventListener('scroll', handleViewportChange)
    }
    
    // Fallback to window resize
    window.addEventListener('resize', handleViewportChange)
    
    // Also listen to focus/blur events on inputs (helps on some Android devices)
    document.addEventListener('focusin', handleViewportChange)
    document.addEventListener('focusout', handleViewportChange)
    
    // Initial check
    updateKeyboardHeight()
  })
  
  onUnmounted(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportChange)
      window.visualViewport.removeEventListener('scroll', handleViewportChange)
    }
    window.removeEventListener('resize', handleViewportChange)
    document.removeEventListener('focusin', handleViewportChange)
    document.removeEventListener('focusout', handleViewportChange)
  })
  
  return {
    keyboardHeight,
    isKeyboardOpen
  }
}