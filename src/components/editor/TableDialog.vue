<template>
  <div 
    class="rounded-lg p-6 w-full max-w-md shadow-lg"
    :style="dialogStyle"
  >
    <h3 class="text-lg font-medium mb-4" :style="headerStyle">Insert Table</h3>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Rows:</label>
        <input 
          type="number" 
          v-model.number="rows" 
          min="1"
          max="20"
          class="w-full px-3 py-2 border rounded-md"
          :style="inputStyle"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Columns:</label>
        <input 
          type="number" 
          v-model.number="cols" 
          min="1"
          max="10"
          class="w-full px-3 py-2 border rounded-md"
          :style="inputStyle"
        />
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Cell Width:</label>
      <input 
        type="text" 
        v-model="cellWidth" 
        class="w-full px-3 py-2 border rounded-md"
        :style="inputStyle"
        placeholder="e.g., 100px"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Cell Height:</label>
      <input 
        type="text" 
        v-model="cellHeight" 
        class="w-full px-3 py-2 border rounded-md"
        :style="inputStyle"
        placeholder="e.g., 40px"
      />
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Border Width:</label>
        <input 
          type="text" 
          v-model="borderWidth" 
          class="w-full px-3 py-2 border rounded-md"
          :style="inputStyle"
          placeholder="e.g., 1px"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Cell Padding:</label>
        <input 
          type="text" 
          v-model="cellPadding" 
          class="w-full px-3 py-2 border rounded-md"
          :style="inputStyle"
          placeholder="e.g., 8px"
        />
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Border Color:</label>
      <div class="relative">
        <input 
          type="text" 
          v-model="borderColor" 
          class="w-full px-3 py-2 border rounded-md"
          :style="inputStyle"
          placeholder="#dddddd"
        />
        <div 
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border rounded-sm"
          :style="{ backgroundColor: borderColor || '#dddddd', borderColor: theme.edgeColor }"
        ></div>
      </div>
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input type="checkbox" v-model="includeHeader" class="mr-2" />
        <span class="text-sm" :style="{ color: theme.contentFgColor }">Include header row</span>
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
        @click="insertTable"
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
    const rows = ref(3);
    const cols = ref(3);
    const cellWidth = ref('100px');
    const cellHeight = ref('40px');
    const borderWidth = ref('1px');
    const borderColor = ref('#dddddd');
    const cellPadding = ref('8px');
    const includeHeader = ref(false);

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

    const insertTable = () => {
      const options = {
        cellWidth: cellWidth.value,
        cellHeight: cellHeight.value,
        borderWidth: borderWidth.value,
        borderColor: borderColor.value,
        cellPadding: cellPadding.value,
        includeHeader: includeHeader.value
      };

      emit('insert', rows.value, cols.value, options);
    };

    return {
      rows,
      cols,
      cellWidth,
      cellHeight,
      borderWidth,
      borderColor,
      cellPadding,
      includeHeader,
      insertTable,
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
