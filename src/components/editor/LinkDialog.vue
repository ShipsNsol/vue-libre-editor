<template>
  <div 
    class="rounded-lg p-6 w-full max-w-md shadow-lg"
    :style="dialogStyle"
  >
    <h3 class="text-lg font-medium mb-4" :style="headerStyle">Insert Link</h3>
    
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">URL:</label>
      <input 
        type="text" 
        v-model="url" 
        class="w-full px-3 py-2 border rounded-md"
        :style="inputStyle"
        placeholder="https://example.com"
        @keydown.enter="insertLink"
      />
    </div>
    
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Text:</label>
      <input 
        type="text" 
        v-model="text" 
        class="w-full px-3 py-2 border rounded-md"
        :style="inputStyle"
        placeholder="Link text (optional)"
      />
    </div>
    
    <div class="mb-4">
      <label class="flex items-center">
        <input type="checkbox" v-model="openInNewTab" class="mr-2" />
        <span class="text-sm" :style="{ color: theme.contentFgColor }">Open in new tab</span>
      </label>
    </div>
    
    <div class="flex justify-end space-x-2">
      <button 
        class="px-4 py-2 rounded hover:opacity-90 active:opacity-80"
        :style="cancelButtonStyle"
        @click="$emit('close')"
      >
        Cancel
      </button>
      <button 
        class="px-4 py-2 rounded hover:opacity-90 active:opacity-80"
        :style="confirmButtonStyle"
        @click="insertLink"
        :disabled="!url"
      >
        Insert
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    theme: {
      type: Object,
      default: () => ({
        headerBgColor: '#f3f4f6',
        headerFgColor: '#111827',
        contentBgColor: '#ffffff',
        contentFgColor: '#111827',
        edgeColor: '#d1d5db'
      })
    }
  },
  emits: ['close', 'insert'],
  setup(props, { emit }) {
    const url = ref('');
    const text = ref('');
    const openInNewTab = ref(true);
    
    // Computed styles based on theme
    const dialogStyle = computed(() => ({
      backgroundColor: props.theme.contentBgColor,
      color: props.theme.contentFgColor,
      border: `1px solid ${props.theme.edgeColor}`,
      fontFamily: 'inherit'
    }));
    
    const headerStyle = computed(() => ({
      backgroundColor: props.theme.headerBgColor,
      color: props.theme.headerFgColor,
      padding: '8px',
      margin: '-24px -24px 16px -24px',
      borderTopLeftRadius: '0.5rem',
      borderTopRightRadius: '0.5rem',
      borderBottom: `1px solid ${props.theme.edgeColor}`
    }));
    
    const inputStyle = computed(() => ({
      backgroundColor: props.theme.contentBgColor,
      color: props.theme.contentFgColor,
      borderColor: props.theme.edgeColor
    }));
    
    const cancelButtonStyle = computed(() => ({
      backgroundColor: '#e5e7eb',
      color: '#111827'
    }));
    
    const confirmButtonStyle = computed(() => ({
      backgroundColor: '#2563eb',
      color: '#ffffff'
    }));
    
    const insertLink = () => {
      if (url.value) {
        emit('insert', url.value, text.value, openInNewTab.value);
      }
    };
    
    return {
      url,
      text,
      openInNewTab,
      insertLink,
      dialogStyle,
      headerStyle,
      inputStyle,
      cancelButtonStyle,
      confirmButtonStyle
    };
  }
};
</script>

<style scoped>
button:active {
  transform: scale(0.97);
}
</style>