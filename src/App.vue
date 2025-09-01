<template>
  <div class="terminal-container">
    <iframe 
      ref="terminalFrame"
      class="terminal-iframe"
      :src="terminalUrl"
      frameborder="0"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const terminalFrame = ref(null)
const terminalUrl = ref('')

onMounted(() => {
  // Use the same host but ttyd port
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  terminalUrl.value = `${protocol}//${hostname}:8021`
})
</script>

<style scoped>
.terminal-container {
  width: 100vw;
  height: 100vh;
  background: #000;
  position: fixed;
  top: 0;
  left: 0;
}

.terminal-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>