<template>
  <div 
    class="rounded-lg p-6 w-full max-w-md shadow-lg"
    :style="dialogStyle"
  >
    <h3 class="text-lg font-medium mb-4" :style="headerStyle">Cell Background Color</h3>
    
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Color:</label>
      <div class="relative">
        <input 
          type="text" 
          v-model="color" 
          class="w-full px-3 py-2 border rounded-md"
          :style="inputStyle"
          placeholder="#ffffff"
        />
        <div 
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border rounded-sm"
          :style="{ backgroundColor: color || '#ffffff', borderColor: theme.edgeColor }"
        ></div>
      </div>
    </div>
    
    <div class="grid grid-cols-5 gap-2 mb-4">
      <button 
        v-for="colorOption in colors" 
        :key="colorOption"
        class="w-10 h-10 border rounded-sm hover:opacity-80 active:opacity-70"
        :style="{ backgroundColor: colorOption, borderColor: theme.edgeColor }"
        @click="color = colorOption"
      ></button>
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
        @click="applyColor"
      >
        Apply
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
  emits: ['close', 'apply'],
  setup(props, { emit }) {
    const color = ref('#ffffff');
    
    const colors = [
      '#ffffff', '#f2f2f2', '#f9f9f9', '#efefef', '#e6e6e6',
      '#f8f0e3', '#fcf8e3', '#d9edf7', '#dff0d8', '#f2dede',
      '#d9d2e9', '#ead1dc', '#d0e0e3', '#d9ead3', '#fff2cc',
      '#fce5cd', '#f4cccc', '#e6b8af', '#cfe2f3', '#c9daf8'
    ];
    
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
    
    const applyColor = () => {
      emit('apply', color.value);
    };
    
    return {
      color,
      colors,
      applyColor,
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