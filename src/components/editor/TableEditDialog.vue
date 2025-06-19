<template>
  <div 
    class="rounded-lg p-6 w-full max-w-md shadow-lg"
    :style="dialogStyle"
  >
    <h3 class="text-lg font-medium mb-4" :style="headerStyle">Edit Table</h3>

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

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
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
      <div>
        <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Header Background:</label>
        <div class="relative">
          <input 
            type="text" 
            v-model="headerBgColor" 
            class="w-full px-3 py-2 border rounded-md"
            :style="inputStyle"
            placeholder="#f2f2f2"
          />
          <div 
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border rounded-sm"
            :style="{ backgroundColor: headerBgColor || '#f2f2f2', borderColor: theme.edgeColor }"
          ></div>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input type="checkbox" v-model="zebraStriping" class="mr-2" />
        <span class="text-sm" :style="{ color: theme.contentFgColor }">Enable zebra striping</span>
      </label>
    </div>

    <div v-if="zebraStriping" class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Even Row Color:</label>
        <div class="relative">
          <input 
            type="text" 
            v-model="evenRowColor" 
            class="w-full px-3 py-2 border rounded-md"
            :style="inputStyle"
            placeholder="#f9f9f9"
          />
          <div 
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border rounded-sm"
            :style="{ backgroundColor: evenRowColor || '#f9f9f9', borderColor: theme.edgeColor }"
          ></div>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" :style="{ color: theme.contentFgColor }">Odd Row Color:</label>
        <div class="relative">
          <input 
            type="text" 
            v-model="oddRowColor" 
            class="w-full px-3 py-2 border rounded-md"
            :style="inputStyle"
            placeholder="transparent"
          />
          <div 
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border rounded-sm"
            :style="{ backgroundColor: oddRowColor || 'transparent', borderColor: theme.edgeColor }"
          ></div>
        </div>
      </div>
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
        @click="applyChanges"
      >
        Apply
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

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
    },
    selectedTable: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'apply'],
  setup(props, { emit }) {
    const cellWidth = ref('100px');
    const cellHeight = ref('40px');
    const borderWidth = ref('1px');
    const borderColor = ref('#dddddd');
    const cellPadding = ref('8px');
    const headerBgColor = ref('#f2f2f2');
    const zebraStriping = ref(true);
    const evenRowColor = ref('#f9f9f9');
    const oddRowColor = ref('transparent');

    // Initialize values from the selected table if available
    onMounted(() => {
      if (props.selectedTable) {
        const table = props.selectedTable;

        // Get cell width and height from the first cell
        const firstCell = table.querySelector('td, th');
        if (firstCell) {
          if (firstCell.style.width) {
            cellWidth.value = firstCell.style.width;
          }
          if (firstCell.style.height) {
            cellHeight.value = firstCell.style.height;
          }

          // Get border width and color from the first cell
          const borderStyle = firstCell.style.border;
          if (borderStyle) {
            const match = borderStyle.match(/(\d+(?:px|em|rem|%)).*?(#[0-9a-f]{3,6}|rgba?\(.*?\)|[a-z]+)/i);
            if (match) {
              borderWidth.value = match[1] || '1px';
              borderColor.value = match[2] || '#dddddd';
            }
          }

          // Get cell padding
          if (firstCell.style.padding) {
            cellPadding.value = firstCell.style.padding;
          }
        }

        // Get header background color
        const header = table.querySelector('th');
        if (header && header.style.backgroundColor) {
          headerBgColor.value = header.style.backgroundColor;
        }

        // Check for zebra striping
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length > 1) {
          const firstRow = rows[0];
          const secondRow = rows[1];

          if (firstRow.style.backgroundColor !== secondRow.style.backgroundColor) {
            zebraStriping.value = true;
            if (firstRow.style.backgroundColor) {
              oddRowColor.value = firstRow.style.backgroundColor;
            }
            if (secondRow.style.backgroundColor) {
              evenRowColor.value = secondRow.style.backgroundColor;
            }
          } else {
            zebraStriping.value = false;
          }
        }
      }
    });

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

    const applyChanges = () => {
      const options = {
        cellWidth: cellWidth.value,
        cellHeight: cellHeight.value,
        borderWidth: borderWidth.value,
        borderColor: borderColor.value,
        cellPadding: cellPadding.value,
        headerBgColor: headerBgColor.value,
        zebraStriping: zebraStriping.value,
        evenRowColor: evenRowColor.value,
        oddRowColor: oddRowColor.value
      };

      emit('apply', options);
    };

    return {
      cellWidth,
      cellHeight,
      borderWidth,
      borderColor,
      cellPadding,
      headerBgColor,
      zebraStriping,
      evenRowColor,
      oddRowColor,
      applyChanges,
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
