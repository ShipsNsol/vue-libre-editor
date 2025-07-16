<template>
  <div 
    class="editor-toolbar flex flex-wrap gap-1 p-2"
    :style="toolbarStyle"
  >
    <!-- Font family -->
    <select 
      class="h-8 px-2 border rounded text-sm"
      :style="selectStyle"
      @change="$emit('execute-command', 'fontName', $event.target.value)"
    >
      <option value="" disabled selected>Font</option>
      <option value="Arial">Arial</option>
      <option value="Helvetica">Helvetica</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Courier New">Courier New</option>
      <option value="Georgia">Georgia</option>
      <option value="Verdana">Verdana</option>
      <option value="Impact">Impact</option>
    </select>
    
    <!-- Font size -->
    <select 
      class="h-8 px-2 border rounded text-sm"
      :style="selectStyle"
      @change="changeFontSize($event.target.value)"
    >
      <option value="" disabled selected>Size</option>
      <option value="8">8px</option>
      <option value="10">10px</option>
      <option value="12">12px</option>
      <option value="14">14px</option>
      <option value="16">16px</option>
      <option value="18">18px</option>
      <option value="20">20px</option>
      <option value="24">24px</option>
      <option value="28">28px</option>
      <option value="32">32px</option>
      <option value="36">36px</option>
      <option value="48">48px</option>
      <option value="72">72px</option>
    </select>
    
    <!-- Text color -->
    <div class="relative" ref="textColorPickerRef">
      <button 
        class="p-1 rounded flex items-center"
        :style="buttonStyle"
        @click="toggleTextColorPicker"
        title="Text Color"
      >
        <span class="w-4 h-4 border rounded-sm" :style="{ backgroundColor: textColor, borderColor: theme.edgeColor }"></span>
      </button>
      
      <div v-if="showColorPicker" class="absolute top-full left-0 mt-1 p-2 border rounded shadow-lg z-10 w-64" :style="dropdownStyle">
        <div class="mb-2">
          <input 
            type="text" 
            v-model="textColor" 
            class="w-full px-2 py-1 border rounded text-sm"
            :style="inputStyle"
            placeholder="#000000"
            @keydown.enter="applyTextColor"
          />
        </div>
        <div class="grid grid-cols-5 gap-1">
          <button 
            v-for="color in colors" 
            :key="color"
            class="w-8 h-8 border rounded-sm hover:opacity-80 active:opacity-70"
            :style="{ backgroundColor: color, borderColor: theme.edgeColor }"
            @click="changeTextColor(color)"
          ></button>
        </div>
        <div class="mt-2 flex justify-end">
          <button 
            class="px-2 py-1 rounded text-sm hover:opacity-90 active:opacity-80"
            :style="applyButtonStyle"
            @click="applyTextColor"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
    
    <!-- Background color -->
    <div class="relative" ref="bgColorPickerRef">
      <button 
        class="p-1 rounded flex items-center"
        :style="buttonStyle"
        @click="toggleBgColorPicker"
        title="Background Color"
      >
        <span class="w-4 h-4 border rounded-sm" :style="{ backgroundColor: bgColor, borderColor: theme.edgeColor }"></span>
      </button>
      
      <div v-if="showBgColorPicker" class="absolute top-full left-0 mt-1 p-2 border rounded shadow-lg z-10 w-64" :style="dropdownStyle">
        <div class="mb-2">
          <input 
            type="text" 
            v-model="bgColor" 
            class="w-full px-2 py-1 border rounded text-sm"
            :style="inputStyle"
            placeholder="#ffffff"
            @keydown.enter="applyBgColor"
          />
        </div>
        <div class="grid grid-cols-5 gap-1">
          <button 
            v-for="color in colors" 
            :key="color"
            class="w-8 h-8 border rounded-sm hover:opacity-80 active:opacity-70"
            :style="{ backgroundColor: color, borderColor: theme.edgeColor }"
            @click="changeBackgroundColor(color)"
          ></button>
        </div>
        <div class="mt-2 flex justify-end">
          <button 
            class="px-2 py-1 rounded text-sm hover:opacity-90 active:opacity-80"
            :style="applyButtonStyle"
            @click="applyBgColor"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
    
    <div class="h-8 w-px mx-1" :style="{ backgroundColor: theme.edgeColor }"></div>
    
    <!-- Text formatting -->
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.bold }"
      :style="commandStates.bold ? activeButtonStyle : buttonStyle"
      @click="executeCommand('bold')"
      title="Bold"
    >
      <Bold class="h-4 w-4" :style="{ color: commandStates.bold ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.italic }"
      :style="commandStates.italic ? activeButtonStyle : buttonStyle"
      @click="executeCommand('italic')"
      title="Italic"
    >
      <Italic class="h-4 w-4" :style="{ color: commandStates.italic ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.underline }"
      :style="commandStates.underline ? activeButtonStyle : buttonStyle"
      @click="executeCommand('underline')"
      title="Underline"
    >
      <Underline class="h-4 w-4" :style="{ color: commandStates.underline ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.strikeThrough }"
      :style="commandStates.strikeThrough ? activeButtonStyle : buttonStyle"
      @click="executeCommand('strikeThrough')"
      title="Strike Through"
    >
      <Strikethrough class="h-4 w-4" :style="{ color: commandStates.strikeThrough ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <div class="h-8 w-px mx-1" :style="{ backgroundColor: theme.edgeColor }"></div>
    
    <!-- Text alignment -->
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.justifyLeft }"
      :style="commandStates.justifyLeft ? activeButtonStyle : buttonStyle"
      @click="executeCommand('justifyLeft')"
      title="Align Left"
    >
      <AlignLeft class="h-4 w-4" :style="{ color: commandStates.justifyLeft ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.justifyCenter }"
      :style="commandStates.justifyCenter ? activeButtonStyle : buttonStyle"
      @click="executeCommand('justifyCenter')"
      title="Align Center"
    >
      <AlignCenter class="h-4 w-4" :style="{ color: commandStates.justifyCenter ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.justifyRight }"
      :style="commandStates.justifyRight ? activeButtonStyle : buttonStyle"
      @click="executeCommand('justifyRight')"
      title="Align Right"
    >
      <AlignRight class="h-4 w-4" :style="{ color: commandStates.justifyRight ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :class="{ 'editor-button-active': commandStates.justifyFull }"
      :style="commandStates.justifyFull ? activeButtonStyle : buttonStyle"
      @click="executeCommand('justifyFull')"
      title="Justify"
    >
      <AlignJustify class="h-4 w-4" :style="{ color: commandStates.justifyFull ? activeIconColor : theme.headerFgColor }" />
    </button>
    
    <div class="h-8 w-px mx-1" :style="{ backgroundColor: theme.edgeColor }"></div>
    
    <!-- Indentation -->
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="executeCommand('outdent')"
      title="Decrease Indent"
    >
      <Outdent class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="executeCommand('indent')"
      title="Increase Indent"
    >
      <Indent class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
    
    <div class="h-8 w-px mx-1" :style="{ backgroundColor: theme.edgeColor }"></div>
    
    <!-- Insert elements -->
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="$emit('insert-image')"
      title="Insert Image"
    >
      <ImageIcon class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="$emit('insert-table')"
      title="Insert Table"
    >
      <Table class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
    
    <!-- Table tools - only visible when a table is selected -->
    <div v-if="selectedElement && selectedElement.tagName === 'TABLE'" class="flex items-center">
      <button 
        class="p-1 rounded"
        :style="buttonStyle"
        @click="$emit('edit-table')"
        title="Edit Table"
      >
        <Settings class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
      </button>
    </div>
    
    <!-- Cell tools - only visible when a cell is selected -->
    <div v-if="selectedCell && (selectedCell.tagName === 'TD' || selectedCell.tagName === 'TH')" class="flex items-center">
<!--      <button -->
<!--        class="p-1 rounded"-->
<!--        :style="buttonStyle"-->
<!--        @click="$emit('split-cell')"-->
<!--        title="Split Cell"-->
<!--      >-->
<!--        <SplitSquareVertical class="h-4 w-4" :style="{ color: theme.headerFgColor }" />-->
<!--      </button>-->
      
<!--      <button -->
<!--        class="p-1 rounded"-->
<!--        :style="buttonStyle"-->
<!--        @click="$emit('merge-cells')"-->
<!--        title="Merge Cells"-->
<!--      >-->
<!--        <Combine class="h-4 w-4" :style="{ color: theme.headerFgColor }" />-->
<!--      </button>-->
      
      <button 
        class="p-1 rounded"
        :style="buttonStyle"
        @click="$emit('cell-color')"
        title="Cell Background Color"
      >
        <Paintbrush class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
      </button>
    </div>
    
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="$emit('insert-link')"
      title="Insert Link"
    >
      <Link class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
    
    <div class="h-8 w-px mx-1" :style="{ backgroundColor: theme.edgeColor }"></div>
    
    <!-- Undo/Redo -->
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="executeCommand('undo')"
      title="Undo"
    >
      <Undo class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
    
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="executeCommand('redo')"
      title="Redo"
    >
      <Redo class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
    
    <div class="h-8 w-px mx-1" :style="{ backgroundColor: theme.edgeColor }"></div>
    
    <!-- Clear formatting -->
    <button 
      class="p-1 rounded"
      :style="buttonStyle"
      @click="executeCommand('removeFormat')"
      title="Clear Formatting"
    >
      <X class="h-4 w-4" :style="{ color: theme.headerFgColor }" />
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Outdent, Indent,
  Image as ImageIcon, Link, Undo, Redo, X,
  Table, Settings, SplitSquareVertical, Combine, Paintbrush
} from 'lucide-vue-next';

export default {
  components: {
    Bold, Italic, Underline, Strikethrough, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Outdent, Indent,
    ImageIcon, Link, Undo, Redo, X,
    Table, Settings, SplitSquareVertical, Combine, Paintbrush
  },
  props: {
    editor: {
      type: Object,
      default: null
    },
    theme: {
      type: Object,
      default: () => ({
        headerBgColor: '#f3f4f6',
        headerFgColor: '#111827',
        contentBgColor: '#ffffff',
        contentFgColor: '#111827',
        edgeColor: '#d1d5db',
        activeButtonBg: '#e5e7eb',
        activeButtonFg: '#2563eb'
      })
    },
    selectedElement: {
      type: Object,
      default: null
    },
    selectedCell: {
      type: Object,
      default: null
    }
  },
  emits: ['execute-command', 'insert-image', 'insert-table', 'insert-link', 'edit-table', 'split-cell', 'merge-cells', 'cell-color'],
  setup(props, { emit }) {
    const showColorPicker = ref(false);
    const showBgColorPicker = ref(false);
    const textColor = ref('#000000');
    const bgColor = ref('#ffffff');
    const textColorPickerRef = ref(null);
    const bgColorPickerRef = ref(null);
    
    // Track command states in a reactive object
    const commandStates = reactive({
      bold: false,
      italic: false,
      underline: false,
      strikeThrough: false,
      justifyLeft: false,
      justifyCenter: false,
      justifyRight: false,
      justifyFull: false
    });
    
    // Update command states
    const updateCommandStates = () => {
      try {
        commandStates.bold = document.queryCommandState('bold');
        commandStates.italic = document.queryCommandState('italic');
        commandStates.underline = document.queryCommandState('underline');
        commandStates.strikeThrough = document.queryCommandState('strikeThrough');
        commandStates.justifyLeft = document.queryCommandState('justifyLeft');
        commandStates.justifyCenter = document.queryCommandState('justifyCenter');
        commandStates.justifyRight = document.queryCommandState('justifyRight');
        commandStates.justifyFull = document.queryCommandState('justifyFull');
      } catch (e) {
        console.warn('Error updating command states:', e);
      }
    };
    
    // Set up event listeners for selection changes
    onMounted(() => {
      document.addEventListener('selectionchange', updateCommandStates);
      document.addEventListener('click', handleClickOutside);
      
      // Initial update
      updateCommandStates();
    });
    
    onUnmounted(() => {
      document.removeEventListener('selectionchange', updateCommandStates);
      document.removeEventListener('click', handleClickOutside);
    });
    
    // Watch for theme changes and update command states
    watch(() => props.theme, () => {
      // Force a re-render of active buttons when theme changes
      updateCommandStates();
    }, { deep: true });
    
    const colors = [
      '#000000', '#434343', '#666666', '#999999', '#b7b7b7',
      '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff', '#980000',
      '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff',
      '#4a86e8', '#0000ff', '#9900ff', '#ff00ff', '#e6b8af',
      '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3',
      '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'
    ];
    
    // Determine active button background color based on theme
    const activeButtonBg = computed(() => {
      // If theme explicitly defines activeButtonBg, use it
      if (props.theme.activeButtonBg) {
        return props.theme.activeButtonBg;
      }
      
      // Otherwise, calculate based on the header background color
      const isDark = isColorDark(props.theme.headerBgColor);
      
      if (isDark) {
        // For dark themes, use a lighter shade for better visibility
        return lightenColor(props.theme.headerBgColor, 20);
      } else {
        // For light themes, use a slightly darker shade
        return darkenColor(props.theme.headerBgColor, 10);
      }
    });
    
    // Determine active icon color based on theme
    const activeIconColor = computed(() => {
      // If theme explicitly defines activeButtonFg, use it
      if (props.theme.activeButtonFg) {
        return props.theme.activeButtonFg;
      }
      
      // Otherwise, use a blue accent color for active icons
      return '#2563eb'; // Default blue accent
    });
    
    // Computed styles based on theme
    const toolbarStyle = computed(() => ({
      backgroundColor: props.theme.headerBgColor,
      color: props.theme.headerFgColor,
      borderBottom: `1px solid ${props.theme.edgeColor}`
    }));
    
    const buttonStyle = computed(() => ({
      backgroundColor: 'transparent',
      borderColor: props.theme.edgeColor,
      color: props.theme.headerFgColor,
      transition: 'all 0.2s ease'
    }));
    
    const activeButtonStyle = computed(() => {
      // Ensure we're returning a new object each time to force reactivity
      return {
        backgroundColor: activeButtonBg.value,
        borderColor: props.theme.edgeColor,
        color: props.theme.headerFgColor,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      };
    });
    
    const selectStyle = computed(() => ({
      backgroundColor: props.theme.contentBgColor,
      color: props.theme.contentFgColor,
      borderColor: props.theme.edgeColor
    }));
    
    const dropdownStyle = computed(() => ({
      backgroundColor: props.theme.contentBgColor,
      color: props.theme.contentFgColor,
      borderColor: props.theme.edgeColor
    }));
    
    const inputStyle = computed(() => ({
      backgroundColor: props.theme.contentBgColor,
      color: props.theme.contentFgColor,
      borderColor: props.theme.edgeColor
    }));
    
    const applyButtonStyle = computed(() => ({
      backgroundColor: '#2563eb',
      color: '#ffffff'
    }));
    
    // Function to check if a color is dark
    const isColorDark = (hexColor) => {
      // Convert hex to RGB
      const r = parseInt(hexColor.substring(1, 3), 16);
      const g = parseInt(hexColor.substring(3, 5), 16);
      const b = parseInt(hexColor.substring(5, 7), 16);
      
      // Calculate brightness (YIQ formula)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return true if the color is dark (brightness < 128)
      return brightness < 128;
    };
    
    // Function to lighten a color
    const lightenColor = (hexColor, amount) => {
      // Convert hex to RGB
      let r = parseInt(hexColor.substring(1, 3), 16);
      let g = parseInt(hexColor.substring(3, 5), 16);
      let b = parseInt(hexColor.substring(5, 7), 16);
      
      // Lighten the color
      r = Math.min(255, r + amount);
      g = Math.min(255, g + amount);
      b = Math.min(255, b + amount);
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    
    // Function to darken a color
    const darkenColor = (hexColor, amount) => {
      // Convert hex to RGB
      let r = parseInt(hexColor.substring(1, 3), 16);
      let g = parseInt(hexColor.substring(3, 5), 16);
      let b = parseInt(hexColor.substring(5, 7), 16);
      
      // Darken the color
      r = Math.max(0, r - amount);
      g = Math.max(0, g - amount);
      b = Math.max(0, b - amount);
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Handle clicks outside of color pickers
    const handleClickOutside = (event) => {
      // Check if text color picker is open and click is outside
      if (showColorPicker.value && 
          textColorPickerRef.value && 
          !textColorPickerRef.value.contains(event.target)) {
        showColorPicker.value = false;
      }
      
      // Check if background color picker is open and click is outside
      if (showBgColorPicker.value && 
          bgColorPickerRef.value && 
          !bgColorPickerRef.value.contains(event.target)) {
        showBgColorPicker.value = false;
      }
    };
    
    const toggleTextColorPicker = (event) => {
      // Prevent the click event from propagating to document
      event.stopPropagation();
      
      // Toggle the color picker
      showColorPicker.value = !showColorPicker.value;
      
      // Close the other color picker if it's open
      if (showColorPicker.value) {
        showBgColorPicker.value = false;
      }
    };
    
    const toggleBgColorPicker = (event) => {
      // Prevent the click event from propagating to document
      event.stopPropagation();
      
      // Toggle the color picker
      showBgColorPicker.value = !showBgColorPicker.value;
      
      // Close the other color picker if it's open
      if (showBgColorPicker.value) {
        showColorPicker.value = false;
      }
    };
    
    const executeCommand = (command, value = null) => {
      emit('execute-command', command, value);
      
      // Update command states immediately after executing a command
      setTimeout(updateCommandStates, 10);
    };
    
    const changeTextColor = (color) => {
      textColor.value = color;
      executeCommand('foreColor', color);
      showColorPicker.value = false;
    };
    
    const applyTextColor = () => {
      executeCommand('foreColor', textColor.value);
      showColorPicker.value = false;
    };
    
    const changeBackgroundColor = (color) => {
      bgColor.value = color;
      executeCommand('hiliteColor', color);
      showBgColorPicker.value = false;
    };
    
    const applyBgColor = () => {
      executeCommand('hiliteColor', bgColor.value);
      showBgColorPicker.value = false;
    };
    
    const changeFontSize = (size) => {
      // Get current selection
      const selection = window.getSelection();
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // If there's a selection, wrap it in a span with the font size
        if (!selection.isCollapsed) {
          const content = range.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = `${size}px`;
          span.appendChild(content);
          range.insertNode(span);
          
          // Update the selection to include the new span
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Emit the command to update the content
          emit('execute-command', 'insertHTML', span.outerHTML);
        } else {
          // If no selection, insert a span at cursor position
          emit('execute-command', 'insertHTML', `<span style="font-size: ${size}px">&nbsp;</span>`);
        }
        
        // Update command states
        updateCommandStates();
      }
    };

    return {
      commandStates,
      showColorPicker,
      showBgColorPicker,
      textColor,
      bgColor,
      colors,
      changeTextColor,
      applyTextColor,
      changeBackgroundColor,
      applyBgColor,
      changeFontSize,
      textColorPickerRef,
      bgColorPickerRef,
      toggleTextColorPicker,
      toggleBgColorPicker,
      toolbarStyle,
      buttonStyle,
      selectStyle,
      dropdownStyle,
      inputStyle,
      applyButtonStyle,
      activeButtonStyle,
      activeButtonBg,
      activeIconColor,
      executeCommand
    };
  }
};
</script>

<style scoped>
/* Add some additional styles for better button feedback */
button {
  transition: all 0.15s ease;
  appearance: button;
  text-transform: none;
  overflow: visible;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
  padding: 0;
  border: 0;
  cursor: pointer;
}

button:focus {
  outline: none;
}

button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

button:active {
  transform: scale(0.97);
}

.editor-button-active {
  font-weight: bold;
}
</style>