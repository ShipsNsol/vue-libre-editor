<template>
  <div
    class="vue-libre-editor border"
    :class="editorThemeClass"
    :style="editorContainerStyle"
  >
    <EditorToolbar
      :editor="editorRef"
      @execute-command="executeCommand"
      @insert-image="showImageDialog = true"
      @insert-table="showTableDialog = true"
      @insert-link="showLinkDialog = true"
      @edit-table="showTableEditDialog = true"
      @cell-color="showCellColorDialog = true"
      :theme="computedTheme"
      :selectedElement="selectedElement"
      :selectedCell="selectedCell"
      @click="handleToolbarClick"
    />

    <div
      ref="editorRef"
      class="editor-content p-4 focus:outline-none"
      contenteditable="true"
      @input="handleInput"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @paste="handlePaste"
      @mouseup="updateSelection"
      @keyup="updateSelection"
      @click="checkSelectedElement"
      :style="editorContentStyle"
    ></div>

    <!-- Image Dialog -->
    <div v-if="showImageDialog" class="fixed inset-0 z-50 flex items-center justify-center">
      <ImageDialog
        @close="showImageDialog = false"
        @insert="insertImage"
        :theme="computedTheme"
      />
    </div>

    <!-- Table Dialog -->
    <div v-if="showTableDialog" class="fixed inset-0 z-50 flex items-center justify-center">
      <TableDialog
        @close="showTableDialog = false"
        @insert="insertTable"
        :theme="computedTheme"
      />
    </div>

    <!-- Table Edit Dialog -->
    <div v-if="showTableEditDialog" class="fixed inset-0 z-50 flex items-center justify-center">
      <TableEditDialog
        @close="showTableEditDialog = false"
        @apply="applyTableChanges"
        :theme="computedTheme"
        :selectedTable="selectedElement"
      />
    </div>

    <!-- Cell Color Dialog -->
    <div v-if="showCellColorDialog" class="fixed inset-0 z-50 flex items-center justify-center">
      <CellColorDialog
        @close="showCellColorDialog = false"
        @apply="applyCellColor"
        :theme="computedTheme"
      />
    </div>

    <!-- Link Dialog -->
    <div v-if="showLinkDialog" class="fixed inset-0 z-50 flex items-center justify-center">
      <LinkDialog
        @close="showLinkDialog = false"
        @insert="insertLink"
        :theme="computedTheme"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import EditorToolbar from './editor/EditorToolbar.vue';
import ImageDialog from './editor/ImageDialog.vue';
import TableDialog from './editor/TableDialog.vue';
import TableEditDialog from './editor/TableEditDialog.vue';
import CellColorDialog from './editor/CellColorDialog.vue';
import LinkDialog from './editor/LinkDialog.vue';


export default {
  name: 'VueLibreEditor',
  components: {
    EditorToolbar,
    ImageDialog,
    TableDialog,
    TableEditDialog,
    CellColorDialog,
    LinkDialog
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Type something...'
    },
    config: {
      type: Object,
      default: () => ({})
    },
    /**
     * Custom CSS variables for theming
     * You can customize the following variables:
     * --spacing: Controls spacing (default: .25rem)
     * --container-md: Controls medium container width (default: 28rem)
     * --text-sm: Controls small text size (default: .875rem)
     * --text-sm--line-height: Controls small text line height (default: calc(1.25 / .875))
     * --text-lg: Controls large text size (default: 1.125rem)
     * --text-lg--line-height: Controls large text line height (default: calc(1.75 / 1.125))
     * --font-weight-medium: Controls medium font weight (default: 500)
     * --font-mono: Controls monospace font family
     * --default-mono-font-family: Controls default monospace font family
     * --default-transition-duration: Controls default transition duration
     * --default-transition-timing-function: Controls default transition timing function
     * 
     * Example usage:
     * :cssVars="{
     *   '--spacing': '4rem',
     *   '--container-md': '44.8rem',
     *   '--text-sm': '1.4rem',
     *   '--text-sm--line-height': 'calc(2 / 1.4)',
     *   '--text-lg': '1.8rem',
     *   '--text-lg--line-height': 'calc(2.8 / 1.8)'
     * }"
     */
    cssVars: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorRef = ref(null);
    const showImageDialog = ref(false);
    const showTableDialog = ref(false);
    const showTableEditDialog = ref(false);
    const showCellColorDialog = ref(false);
    const showLinkDialog = ref(false);
    const selectedElement = ref(null);
    const selectedCell = ref(null);
    let isUpdatingContent = false;
    let resizingTable = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let tableWidth = 0;
    let tableHeight = 0;
    let currentCol = null;
    let nextCol = null;
    let colIndex = 0;
    let resizingRow = null;
    let resizingCell = null;
    
    // Computed property for custom CSS variables
    const customCssVars = computed(() => {
      const vars = props.cssVars;
      
      // Default values for the CSS variables
      const defaultVars = {
        '--font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        '--spacing': '4rem',
        '--container-md': '44.8rem',
        '--text-sm': '1.4rem',
        '--text-sm--line-height': 'calc(2 / 1.4)',
        '--text-lg': '1.8rem',
        '--text-lg--line-height': 'calc(2.8 / 1.8)',
        '--font-weight-medium': '500',
        '--default-transition-duration': '.15s',
        '--default-transition-timing-function': 'cubic-bezier(.4, 0, .2, 1)',
        '--default-mono-font-family': 'var(--font-mono)'
      };
      
      // Merge default values with user-provided values
      return { ...defaultVars, ...vars };
    });

    // Default theme configurations
    const themeConfigs = {
      light: {
        headerBgColor: '#f3f4f6',
        headerFgColor: '#111827',
        contentBgColor: '#ffffff',
        contentFgColor: '#111827',
        edgeColor: '#d1d5db',
        activeButtonBg: '#e5e7eb',
        activeButtonFg: '#2563eb'
      },
      dark: {
        headerBgColor: '#1f2937',
        headerFgColor: '#f9fafb',
        contentBgColor: '#111827',
        contentFgColor: '#f9fafb',
        edgeColor: '#374151',
        activeButtonBg: '#4b5563',
        activeButtonFg: '#60a5fa'
      }
    };

    // Compute the effective theme
    const computedTheme = computed(() => {
      const themeConfig = props.config.theme || {};

      // If theme is specified as a string (light/dark), use predefined theme
      if (typeof themeConfig === 'string' && themeConfigs[themeConfig]) {
        return themeConfigs[themeConfig];
      }

      // If theme is 'none' or custom theme is provided, use custom colors
      if (themeConfig === 'none' || typeof themeConfig === 'object') {
        // Create a new object with default values from light theme
        const defaultTheme = { ...themeConfigs.light };

        // Override with custom values if provided
        if (typeof themeConfig === 'object') {
          return {
            headerBgColor: themeConfig.headerBgColor || defaultTheme.headerBgColor,
            headerFgColor: themeConfig.headerFgColor || defaultTheme.headerFgColor,
            contentBgColor: themeConfig.contentBgColor || defaultTheme.contentBgColor,
            contentFgColor: themeConfig.contentFgColor || defaultTheme.contentFgColor,
            edgeColor: themeConfig.edgeColor || defaultTheme.edgeColor,
            activeButtonBg: themeConfig.activeButtonBg || defaultTheme.activeButtonBg,
            activeButtonFg: themeConfig.activeButtonFg || defaultTheme.activeButtonFg
          };
        }

        return defaultTheme;
      }

      // Default to light theme
      return themeConfigs.light;
    });

    // Computed class for theme
    const editorThemeClass = computed(() => {
      return props.config.theme === 'dark' ? 'editor-theme-dark' : 'editor-theme-light';
    });

    // Computed styles based on config
    const editorContainerStyle = computed(() => {
      const styles = {};
      const sizeConfig = props.config.size || {};

      // Border color from theme
      styles.borderColor = computedTheme.value.edgeColor;

      // Width settings
      if (sizeConfig.width) {
        styles.width = typeof sizeConfig.width === 'number'
          ? `${sizeConfig.width}px`
          : sizeConfig.width;
      }

      if (sizeConfig.minWidth) {
        styles.minWidth = typeof sizeConfig.minWidth === 'number'
          ? `${sizeConfig.minWidth}px`
          : sizeConfig.minWidth;
      }

      if (sizeConfig.maxWidth) {
        styles.maxWidth = typeof sizeConfig.maxWidth === 'number'
          ? `${sizeConfig.maxWidth}px`
          : sizeConfig.maxWidth;
      }

      // Add custom CSS variables
      return { ...styles, ...customCssVars.value };
    });

    const editorContentStyle = computed(() => {
      const styles = {};
      const sizeConfig = props.config.size || {};
      const fontConfig = props.config.font || {};

      // Background and text color from theme
      styles.backgroundColor = computedTheme.value.contentBgColor;
      styles.color = computedTheme.value.contentFgColor;

      // Height settings
      if (sizeConfig.height) {
        styles.height = typeof sizeConfig.height === 'number'
          ? `${sizeConfig.height}px`
          : sizeConfig.height;
      }

      if (sizeConfig.minHeight) {
        styles.minHeight = typeof sizeConfig.minHeight === 'number'
          ? `${sizeConfig.minHeight}px`
          : sizeConfig.minHeight;
      } else {
        styles.minHeight = '200px'; // Default min height
      }

      if (sizeConfig.maxHeight) {
        styles.maxHeight = typeof sizeConfig.maxHeight === 'number'
          ? `${sizeConfig.maxHeight}px`
          : sizeConfig.maxHeight;
        styles.overflowY = 'auto';
      }

      // Font settings
      if (fontConfig.family) {
        styles.fontFamily = fontConfig.family;
      }

      if (fontConfig.size) {
        styles.fontSize = typeof fontConfig.size === 'number'
          ? `${fontConfig.size}px`
          : fontConfig.size;
      }

      return styles;
    });

    // Function to update selection state
    const updateSelection = () => {
      // Trigger a selectionchange event to update toolbar button states
      document.dispatchEvent(new Event('selectionchange'));

      // Check if a table is selected
      checkSelectedElement();
    };

    // Variables for multiple cell selection
    const selectedCells = ref([]);
    let firstSelectedCell = null;
    let isMultiSelecting = false;

    // Function to check if a table or table cell is selected
    const checkSelectedElement = () => {
      if (!editorRef.value) return;

      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;

      // If the node is a text node, get its parent
      if (node.nodeType === 3) {
        node = node.parentNode;
      }

      // Check if the node is a table or inside a table
      let tableElement = null;
      let cellElement = null;
      let resizerElement = null;
      let currentNode = node;

      while (currentNode && currentNode !== editorRef.value) {
        // Check if we're inside a resizer element
        if (currentNode.classList &&
          (currentNode.classList.contains('column-resizer') ||
            currentNode.classList.contains('row-resizer') ||
            currentNode.classList.contains('resizer-container'))) {
          resizerElement = currentNode;
        }

        if (currentNode.tagName === 'TD' || currentNode.tagName === 'TH') {
          cellElement = currentNode;
        }

        if (currentNode.tagName === 'TABLE') {
          tableElement = currentNode;
          break;
        }
        currentNode = currentNode.parentNode;
      }

      selectedElement.value = tableElement;
      selectedCell.value = cellElement;

      // If we have a cell element, check if we need to redirect focus to the cell-content div
      if (cellElement) {
        // Find the cell-content div
        const cellContentDiv = cellElement.querySelector('.cell-content');
        if (cellContentDiv) {
          // Check if the current selection is inside the cell-content div
          let isInsideCellContent = false;
          let currentCheckNode = node;

          while (currentCheckNode && currentCheckNode !== cellElement) {
            if (currentCheckNode === cellContentDiv) {
              isInsideCellContent = true;
              break;
            }
            currentCheckNode = currentCheckNode.parentNode;
          }

          // If we clicked on a resizer element or directly on the td/th element (outside the cell-content div),
          // redirect focus to the cell-content div
          if (resizerElement || !isInsideCellContent) {
            // Create a new range at the end of the cell-content div
            const newRange = document.createRange();

            // Check if the cell-content div has any paragraph tags
            const paragraphs = cellContentDiv.querySelectorAll('p');

            if (paragraphs.length > 0) {
              // If there are paragraph tags, place the cursor inside the last one
              const lastParagraph = paragraphs[paragraphs.length - 1];

              if (lastParagraph.lastChild && lastParagraph.lastChild.nodeType === 3) {
                // If the last child of the paragraph is a text node, place cursor at the end of it
                newRange.setStart(lastParagraph.lastChild, lastParagraph.lastChild.length);
                newRange.setEnd(lastParagraph.lastChild, lastParagraph.lastChild.length);
              } else {
                // Otherwise, append a new text node to the paragraph and place cursor in it
                const textNode = document.createTextNode('');
                lastParagraph.appendChild(textNode);
                newRange.setStart(textNode, 0);
                newRange.setEnd(textNode, 0);
              }
            } else {
              // If there are no paragraph tags, create a new one
              const p = document.createElement('p');
              p.innerHTML = '<br>'; // Add a line break to ensure the paragraph has height
              cellContentDiv.appendChild(p);

              // Place the cursor inside the new paragraph
              newRange.setStart(p.firstChild, 0);
              newRange.setEnd(p.firstChild, 0);
            }

            // Apply the new range
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }

      // Handle cell selection for merging
      if (cellElement) {
        // Always clear previous selection first to prevent multiple selections
        clearCellSelection();

        // If shift key is pressed and we have a first selected cell, handle multi-selection
        if (window.event && window.event.shiftKey && firstSelectedCell) {
          isMultiSelecting = true;

          // Get the table
          const table = tableElement;

          // Find all cells between first selected cell and current cell
          const rows = Array.from(table.querySelectorAll('tr'));

          // Find row indices for first and current cell
          let firstRowIndex = -1;
          let firstCellIndex = -1;
          let currentRowIndex = -1;
          let currentCellIndex = -1;

          rows.forEach((row, rowIndex) => {
            const cells = Array.from(row.cells);

            cells.forEach((cell, cellIndex) => {
              if (cell === firstSelectedCell) {
                firstRowIndex = rowIndex;
                firstCellIndex = cellIndex;
              }
              if (cell === cellElement) {
                currentRowIndex = rowIndex;
                currentCellIndex = cellIndex;
              }
            });
          });

          // Determine the selection rectangle
          const startRow = Math.min(firstRowIndex, currentRowIndex);
          const endRow = Math.max(firstRowIndex, currentRowIndex);
          const startCell = Math.min(firstCellIndex, currentCellIndex);
          const endCell = Math.max(firstCellIndex, currentCellIndex);

          // Select all cells in the rectangle
          for (let i = startRow; i <= endRow; i++) {
            const row = rows[i];
            if (!row) continue;

            const cells = Array.from(row.cells);
            for (let j = startCell; j <= endCell; j++) {
              const cell = cells[j];
              if (cell) {
                cell.classList.add('cell-selected');
                selectedCells.value.push(cell);
              }
            }
          }

          // Keep the first selected cell as the selectedCell.value to maintain toolbar functionality
          selectedCell.value = firstSelectedCell;

          // Add a data attribute to indicate multi-selection mode
          if (selectedCells.value.length > 0) {
            selectedCells.value.forEach(cell => {
              cell.dataset.multiSelected = 'true';
            });
          }
        } else {
          // Single cell selection - always set firstSelectedCell
          firstSelectedCell = cellElement;
          cellElement.classList.add('cell-selected');
          selectedCells.value = [cellElement];
          isMultiSelecting = false;
        }
      } else {
        // Clear selection if clicked outside a cell
        clearCellSelection();
      }
    };

    // Function to clear cell selection
    const clearCellSelection = () => {
      // Remove selection class and data attribute from all previously selected cells
      selectedCells.value.forEach(cell => {
        cell.classList.remove('cell-selected');
        delete cell.dataset.multiSelected;
      });
      selectedCells.value = [];
    };

    // Function to make tables resizable
    const makeTablesResizable = () => {
      if (!editorRef.value) return;

      // Find all tables in the editor
      const tables = editorRef.value.querySelectorAll('table');

      tables.forEach(table => {
        // Skip if already processed
        if (table.dataset.resizable === 'true') return;

        // Mark as processed
        table.dataset.resizable = 'true';

        // Add table resizer
        addTableResizer(table);

        // Add column resizers
        addColumnResizers(table);
      });
    };

    // Function to add a table resizer
    const addTableResizer = (table) => {
      // Set position relative for the table to position the resizer
      table.style.position = 'relative';

      // Create a resizer container that sits outside the content area
      const resizerContainer = document.createElement('div');
      resizerContainer.className = 'table-resizer-container';
      resizerContainer.style.position = 'absolute';
      resizerContainer.style.top = '0';
      resizerContainer.style.left = '0';
      resizerContainer.style.width = '100%';
      resizerContainer.style.height = '100%';
      resizerContainer.style.pointerEvents = 'none'; // Allow clicks to pass through to the table
      resizerContainer.style.zIndex = '1';

      // Create a resizer for the entire table
      const tableResizer = document.createElement('div');
      tableResizer.className = 'table-resizer';
      tableResizer.style.position = 'absolute';
      tableResizer.style.right = '-5px';
      tableResizer.style.bottom = '-5px';
      tableResizer.style.width = '10px';
      tableResizer.style.height = '10px';
      tableResizer.style.cursor = 'nwse-resize';
      tableResizer.style.backgroundColor = '#2563eb';
      tableResizer.style.borderRadius = '50%';
      tableResizer.style.zIndex = '2';
      tableResizer.style.pointerEvents = 'auto'; // Capture mouse events for this element

      // Add event listeners for resizing the table
      tableResizer.addEventListener('mousedown', (e) => {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = table.offsetWidth;
        const startHeight = table.offsetHeight;

        // Store original cell dimensions for proportional resizing
        const rows = table.querySelectorAll('tr');
        const allCells = [];

        rows.forEach(row => {
          const cells = row.querySelectorAll('th, td');
          cells.forEach(cell => {
            allCells.push({
                            cell,
                            width: cell.offsetWidth,
                            height: cell.offsetHeight,
                            widthRatio: cell.offsetWidth / startWidth,
                            heightRatio: cell.offsetHeight / startHeight
                          });
          });
        });

        const onMouseMove = (e) => {
          // Calculate new dimensions
          const newWidth = Math.max(20, startWidth + (e.clientX - startX));
          const newHeight = Math.max(20, startHeight + (e.clientY - startY));

          // Resize all cells proportionally
          allCells.forEach(item => {
            // Calculate new cell dimensions based on ratios
            const newCellWidth = Math.max(20, newWidth * item.widthRatio);
            const newCellHeight = Math.max(20, newHeight * item.heightRatio);

            // Apply new dimensions to the cell
            item.cell.style.width = `${newCellWidth}px`;
            item.cell.style.height = `${newCellHeight}px`;
          });

          // Update content
          handleInput();
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.classList.remove('resizing');
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.classList.add('resizing');
      });

      // Add the resizer to the container
      resizerContainer.appendChild(tableResizer);

      // Add the container to the table
      table.appendChild(resizerContainer);
    };

    // Function to add column resizers
    const addColumnResizers = (table) => {
      // Add resize handles to each column
      const rows = table.querySelectorAll('tr');
      if (rows.length === 0) return;

      // Process each row to add resizers to all cells
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('th, td');

        cells.forEach((cell, cellIndex) => {
          // Skip if already has a resizer
          if (cell.querySelector('.column-resizer')) return;

          // Save the current content of the cell
          const cellContent = cell.innerHTML;

          // Clear the cell content (we'll add it to the content div)
          cell.innerHTML = '';

          // Set position relative for the cell to position the resizer
          cell.style.position = 'relative';

          // Create a content div for the cell text
          const contentDiv = document.createElement('div');
          contentDiv.className = 'cell-content';
          // Use the cell's current width instead of percentage
          const cellWidth = cell.offsetWidth;
          // contentDiv.style.width = cellWidth > 0 ? `${cellWidth}px` : 'auto';
          contentDiv.style.height = '100%';
          contentDiv.style.position = 'relative';
          contentDiv.style.zIndex = '0';
          contentDiv.style.overflow = 'hidden'; // Prevent text from overflowing
          contentDiv.style.wordWrap = 'break-word'; // Break long words if they exceed the cell width
          contentDiv.style.whiteSpace = 'normal'; // Allow text to wrap to the next line
          // Wrap the original content in a paragraph tag if it's not empty
          if (cellContent.trim()) {
            contentDiv.innerHTML = `<p>${cellContent}</p>`; // Put the original content in a paragraph tag
          } else {
            contentDiv.innerHTML = cellContent; // Keep empty content as is
          }

          // Add the content div to the cell first
          cell.appendChild(contentDiv);

          // Create a resizer container that sits outside the content area
          const resizerContainer = document.createElement('div');
          resizerContainer.className = 'resizer-container';
          resizerContainer.style.position = 'absolute';
          resizerContainer.style.top = '0';
          resizerContainer.style.left = '0';
          resizerContainer.style.width = '100%';
          resizerContainer.style.height = '100%';
          resizerContainer.style.pointerEvents = 'none'; // Allow clicks to pass through to the cell
          resizerContainer.style.zIndex = '1';

          // Add column resizer to all cells, including the last one
          const resizer = document.createElement('div');
          resizer.className = 'column-resizer';
          resizer.style.position = 'absolute';
          resizer.style.top = '0';
          resizer.style.right = '-3px';
          resizer.style.width = '6px';
          resizer.style.height = '100%';
          resizer.style.cursor = 'col-resize';
          resizer.style.userSelect = 'none';
          resizer.style.pointerEvents = 'auto'; // Capture mouse events for this element
          resizer.style.zIndex = '1';

          // Store the column index
          resizer.dataset.index = cellIndex.toString();
          resizer.dataset.row = rowIndex.toString();

          // Add event listeners for resizing
          resizer.addEventListener('mousedown', startResize);

          // Add the resizer to the container
          resizerContainer.appendChild(resizer);

          // Add row resizer if this is not the last row
          if (rowIndex < rows.length - 1 || true) { // Always add row resizers, even to the last row
            // Skip if already has a row resizer
            if (cell.querySelector('.q')) return;

            const rowResizer = document.createElement('div');
            rowResizer.className = 'row-resizer';
            rowResizer.style.position = 'absolute';
            rowResizer.style.left = '0';
            rowResizer.style.bottom = '-3px';
            rowResizer.style.width = '100%';
            rowResizer.style.height = '6px';
            rowResizer.style.cursor = 'row-resize';
            rowResizer.style.userSelect = 'none';
            rowResizer.style.pointerEvents = 'auto'; // Capture mouse events for this element
            rowResizer.style.zIndex = '1';

            // Store the row index and cell index
            rowResizer.dataset.rowIndex = rowIndex.toString();
            rowResizer.dataset.cellIndex = cellIndex.toString();

            // Add event listeners for row resizing
            rowResizer.addEventListener('mousedown', startRowResize);

            // Add the row resizer to the container
            resizerContainer.appendChild(rowResizer);
          }

          // Add the resizer container to the cell
          cell.appendChild(resizerContainer);
        });
      });
    };

    // Function to start column resizing
    const startResize = (e) => {
      e.preventDefault();

      // Get the column index
      colIndex = parseInt(e.target.dataset.index);

      // Find the table
      let currentElement = e.target;
      while (currentElement && currentElement.tagName !== 'TABLE') {
        currentElement = currentElement.parentNode;
      }

      if (!currentElement) return;

      resizingTable = currentElement;

      // Get all rows
      const rows = resizingTable.querySelectorAll('tr');
      if (rows.length === 0) return;

      // Get the current column and the next column
      const rowIndex = parseInt(e.target.dataset.row);
      const row = rows[rowIndex];
      const cells = row.querySelectorAll('th, td');

      // Allow resizing the last column
      currentCol = cells[colIndex];
      nextCol = colIndex < cells.length - 1 ? cells[colIndex + 1] : null;

      // Store initial values
      startX = e.clientX;
      startWidth = currentCol.offsetWidth;
      tableWidth = resizingTable.offsetWidth;

      // Add event listeners for dragging
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);

      // Add a class to the body to indicate resizing
      document.body.classList.add('resizing');
    };

    // Function to resize columns
    const resize = (e) => {
      if (!resizingTable) return;

      // Calculate the new width
      const diffX = e.clientX - startX;
      const newWidth = Math.max(20, startWidth + diffX); // Minimum width of 20px

      // Define minimum cell width
      const minCellWidth = 20; // Minimum cell width in pixels

      // Check if the new width is less than the minimum width
      if (newWidth < minCellWidth) {
        // If the new width is less than the minimum width, don't resize
        return;
      }

      // Apply the new width only to the current column being resized
      const rows = resizingTable.querySelectorAll('tr');

      // Apply the new width to all cells in this column only
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        cells[colIndex].style.width = `${newWidth}px`;

        console.log(cells[colIndex]);
      });

      // Update the content
      handleInput();
    };

    // Variables for row resizing
    let rowIndex = 0;

    // Function to start row resizing
    const startRowResize = (e) => {
      e.preventDefault();

      // Get the row index and cell index
      rowIndex = parseInt(e.target.dataset.rowIndex);
      const cellIndex = parseInt(e.target.dataset.cellIndex);

      // Find the table
      let currentElement = e.target;
      while (currentElement && currentElement.tagName !== 'TABLE') {
        currentElement = currentElement.parentNode;
      }

      if (!currentElement) return;

      resizingTable = currentElement;

      // Get all rows
      const rows = resizingTable.querySelectorAll('tr');
      if (rows.length === 0 || rowIndex >= rows.length) return;

      // Get the current row
      resizingRow = rows[rowIndex];

      // Get the specific cell being resized
      const cells = resizingRow.querySelectorAll('th, td');
      if (cellIndex >= 0 && cellIndex < cells.length) {
        resizingCell = cells[cellIndex];
      } else {
        resizingCell = null;
      }

      // Store initial values
      startY = e.clientY;
      startHeight = resizingRow.offsetHeight;
      tableHeight = resizingTable.offsetHeight;

      // Add event listeners for dragging
      document.addEventListener('mousemove', resizeRow);
      document.addEventListener('mouseup', stopRowResize);

      // Add a class to the body to indicate resizing
      document.body.classList.add('resizing');


    };

    // Function to resize rows
    const resizeRow = (e) => {
      if (!resizingTable || !resizingRow) return;

      // Calculate the new height
      const diffY = e.clientY - startY;
      const newHeight = Math.max(20, startHeight + diffY); // Minimum height of 20px

      // Define minimum cell height
      const minCellHeight = 20; // Minimum cell height in pixels

      // Check if the new height is less than the minimum height
      if (newHeight < minCellHeight) {
        // If the new height is less than the minimum height, don't resize
        return;
      }

      // Apply the new height only to the current row being resized
      resizingRow.style.height = `${newHeight}px`;

      // Apply the new height to all cells in this row
      const cells = resizingRow.querySelectorAll('th, td');
      cells.forEach(cell => {
        cell.style.height = `${newHeight}px`;
      });

      // Update the content
      handleInput();
    };

    // Function to stop row resizing
    const stopRowResize = () => {
      document.removeEventListener('mousemove', resizeRow);
      document.removeEventListener('mouseup', stopRowResize);

      // Remove the resizing class
      document.body.classList.remove('resizing');

      // Reset variables
      resizingTable = null;
      resizingRow = null;
      resizingCell = null;
    };

    // Function to stop resizing
    const stopResize = () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);

      // Remove the resizing class
      document.body.classList.remove('resizing');

      // Reset variables
      resizingTable = null;
      currentCol = null;
      nextCol = null;
    };


    // Initialize editor content
    onMounted(() => {
      if (editorRef.value) {
        // Set initial content
        editorRef.value.innerHTML = unwrapContentFromClass(props.modelValue || '');

        // Set placeholder if content is empty
        if (!props.modelValue && props.placeholder) {
          editorRef.value.dataset.placeholder = props.placeholder;
        }

        // Fix for Firefox - ensure document.execCommand works
        try {
          document.execCommand("enableObjectResizing", false, false);
          document.execCommand("enableInlineTableEditing", false, false);
          document.execCommand("defaultParagraphSeparator", false, "p");
        } catch (e) {
          console.warn("Could not enable document.execCommand features", e);
        }

        // Make tables resizable
        makeTablesResizable();

        // Initial update of selection state
        updateSelection();

        // Add event listeners for page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Add event listener for popstate (browser back/forward navigation)
        window.addEventListener('popstate', reinitializeEditor);
      }

      // Clean up event listeners when component is unmounted
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('popstate', reinitializeEditor);
      };
    });

    // Handle visibility change (when user returns to the page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reinitialize the editor when the page becomes visible again
        reinitializeEditor();
      }
    };

    // Reinitialize the editor (reattach event handlers)
    const reinitializeEditor = () => {
      if (editorRef.value) {
        // Make tables resizable again
        makeTablesResizable();

        // Update selection state
        updateSelection();
      }
    };

    // Watch for external changes to modelValue
    watch(() => props.modelValue, (newValue) => {
      if (isUpdatingContent) return;

      if (editorRef.value && editorRef.value.innerHTML !== newValue) {
        // Get current selection info
        const selection = window.getSelection();
        const ranges = [];
        const rangeCount = selection.rangeCount;

        // Store ranges
        for (let i = 0; i < rangeCount; i++) {
          ranges.push(selection.getRangeAt(i));
        }

        // Update content - unwrap from vue-libre-editor-content class if needed
        editorRef.value.innerHTML = unwrapContentFromClass(newValue || '');

        // Make tables resizable
        makeTablesResizable();

        // Restore selection
        nextTick(() => {
          if (ranges.length > 0 && document.activeElement === editorRef.value) {
            selection.removeAllRanges();
            for (let i = 0; i < ranges.length; i++) {
              try {
                selection.addRange(ranges[i]);
              } catch (e) {
                console.warn('Failed to restore selection', e);
              }
            }
          }

          // Update selection state
          updateSelection();
        });
      }
    });

    // Watch for theme changes
    watch(() => props.config.theme, () => {
      // Force update of selection state when theme changes
      nextTick(updateSelection);
    });

    // Function to unwrap content from vue-libre-editor-content class when received by the editor
    const unwrapContentFromClass = (content) => {
      // Check if the content is wrapped with the vue-libre-editor-content class
      if (content && content.includes('class="vue-libre-editor-content"')) {
        // Create a temporary div to manipulate the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Find the div with the vue-libre-editor-content class
        const wrappedDiv = tempDiv.querySelector('.vue-libre-editor-content');

        // If found, return its inner HTML
        if (wrappedDiv) {
          return wrappedDiv.innerHTML;
        }
      }

      // If not wrapped or no wrapper found, return the original content
      return content;
    };

    const handleInput = () => {
      if (!editorRef.value) return;

      isUpdatingContent = true;
      // Wrap the content with vue-libre-editor-content class before emitting
      // const wrappedContent = `<div class="vue-libre-editor-content">${editorRef.value.innerHTML}</div>`;
      emit('update:modelValue', editorRef.value.innerHTML);

      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingContent = false;
      }, 10);

      // Update selection state
      updateSelection();
    };

    const handleBlur = () => {
      // Update content on blur
      if (editorRef.value) {
        // Wrap the content with vue-libre-editor-content class before emitting
        // const wrappedContent = `<div class="vue-libre-editor-content">${editorRef.value.innerHTML}</div>`;
        emit('update:modelValue', editorRef.value.innerHTML);
      }
    };

    const executeCommand = (command, value = null) => {
      if (!editorRef.value) return;

      // Focus the editor
      editorRef.value.focus();

      // Special handling for formatBlock
      if (command === 'formatBlock') {
        // Modern browsers need the tag name without angle brackets
        try {
          document.execCommand(command, false, value);
        } catch (e) {
          // Fallback for older browsers that might need angle brackets
          try {
            document.execCommand(command, false, `<${value}>`);
          } catch (e2) {
            console.warn(`Failed to execute formatBlock command with value: ${value}`, e2);
          }
        }
      } else {
        // Execute other commands normally
        try {
          document.execCommand(command, false, value);
        } catch (e) {
          console.warn(`Failed to execute command: ${command}`, e);
        }
      }

      // Update content
      handleInput();

      // Update selection state
      updateSelection();
    };

    const handleKeyDown = (e) => {
      // Handle tab key to insert spaces instead of changing focus
      if (e.key === 'Tab') {
        e.preventDefault();
        executeCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
      }

      // Handle Enter key inside table cells to prevent cell-content div duplication
      if (e.key === 'Enter') {
        // Check if the current selection is inside a table cell
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node = range.commonAncestorContainer;

          // If the node is a text node, get its parent
          if (node.nodeType === 3) {
            node = node.parentNode;
          }

          // Find the closest td/th element and cell-content div
          let tdElement = null;
          let cellContentDiv = null;
          let resizerElement = null;
          let currentNode = node;

          // First, check if we're directly inside a cell-content div
          while (currentNode && !cellContentDiv) {
            if (currentNode.classList && currentNode.classList.contains('cell-content')) {
              cellContentDiv = currentNode;
              break;
            }

            // Also check if we're inside a resizer element
            if (currentNode.classList &&
              (currentNode.classList.contains('column-resizer') ||
                currentNode.classList.contains('row-resizer') ||
                currentNode.classList.contains('resizer-container'))) {
              resizerElement = currentNode;
            }

            // If we find a td/th element before finding a cell-content div, break
            if (currentNode.tagName === 'TD' || currentNode.tagName === 'TH') {
              tdElement = currentNode;
              break;
            }

            currentNode = currentNode.parentNode;
          }

          // If we didn't find a cell-content div but found a td/th element,
          // look for the cell-content div inside the td/th element
          if (!cellContentDiv && tdElement) {
            cellContentDiv = tdElement.querySelector('.cell-content');
          }

          // If we still don't have a td element, continue searching up from where we left off
          if (!tdElement && currentNode) {
            while (currentNode && !tdElement) {
              if (currentNode.tagName === 'TD' || currentNode.tagName === 'TH') {
                tdElement = currentNode;
                break;
              }
              currentNode = currentNode.parentNode;
            }
          }

          // If we found a td/th element and a cell-content div
          if (tdElement && cellContentDiv) {
            e.preventDefault();

            // Ensure all content is inside the cell-content div
            // First, move any <p> tags that are direct children of the td element into the cell-content div
            const paragraphs = tdElement.querySelectorAll(':scope > p');
            if (paragraphs.length > 0) {
              for (let i = 0; i < paragraphs.length; i++) {
                cellContentDiv.appendChild(paragraphs[i]);
              }
            }

            // Always move the cursor inside the cell-content div
            const newRange = document.createRange();

            // If the cursor is already inside the cell-content div and not in a resizer
            const isInsideContentDiv = cellContentDiv.contains(range.commonAncestorContainer) && !resizerElement;

            if (isInsideContentDiv) {
              // Use the current selection position
              newRange.setStart(range.startContainer, range.startOffset);
              newRange.setEnd(range.endContainer, range.endOffset);
            } else {
              // Place the cursor at the end of the cell-content div
              if (cellContentDiv.lastChild && cellContentDiv.lastChild.nodeType === 3) {
                // If the last child is a text node, place cursor at the end of it
                newRange.setStart(cellContentDiv.lastChild, cellContentDiv.lastChild.length);
                newRange.setEnd(cellContentDiv.lastChild, cellContentDiv.lastChild.length);
              } else if (cellContentDiv.lastChild) {
                // If the last child is an element node, place cursor at the end of it
                const lastChild = cellContentDiv.lastChild;
                if (lastChild.nodeType === 1) { // Element node
                  if (lastChild.lastChild && lastChild.lastChild.nodeType === 3) {
                    // If the last child of the last child is a text node, place cursor at the end of it
                    newRange.setStart(lastChild.lastChild, lastChild.lastChild.length);
                    newRange.setEnd(lastChild.lastChild, lastChild.lastChild.length);
                  } else {
                    // Otherwise, append to the last child
                    const textNode = document.createTextNode('');
                    lastChild.appendChild(textNode);
                    newRange.setStart(textNode, 0);
                    newRange.setEnd(textNode, 0);
                  }
                } else {
                  // Otherwise, append a new text node to the cell-content div
                  const textNode = document.createTextNode('');
                  cellContentDiv.appendChild(textNode);
                  newRange.setStart(textNode, 0);
                  newRange.setEnd(textNode, 0);
                }
              } else {
                // If there are no children, append a new text node
                const textNode = document.createTextNode('');
                cellContentDiv.appendChild(textNode);
                newRange.setStart(textNode, 0);
                newRange.setEnd(textNode, 0);
              }
            }

            // Apply the new range
            selection.removeAllRanges();
            selection.addRange(newRange);

            // Insert a paragraph with a line break inside the cell-content div
            // Use a direct DOM manipulation approach to ensure it's added inside the cell-content div

            // Get the current selection again after setting the range
            const newSelection = window.getSelection();
            if (newSelection.rangeCount > 0) {
              const newRange = newSelection.getRangeAt(0);

              // Check if we're inside a paragraph tag
              let currentParagraph = null;
              let currentNode = newRange.commonAncestorContainer;

              // If the node is a text node, get its parent
              if (currentNode.nodeType === 3) {
                currentNode = currentNode.parentNode;
              }

              // Find the closest paragraph tag
              while (currentNode && currentNode !== cellContentDiv) {
                if (currentNode.tagName === 'P') {
                  currentParagraph = currentNode;
                  break;
                }
                currentNode = currentNode.parentNode;
              }

              if (currentParagraph) {
                // We're inside a paragraph tag, so we need to split it

                // Create a new paragraph for the content after the cursor
                const newParagraph = document.createElement('p');
                newParagraph.innerHTML = '<br>';

                // If the selection is at the end of the paragraph, just add a new paragraph after it
                if (newRange.endOffset === 0 ||
                  (newRange.endContainer.nodeType === 3 && newRange.endOffset === newRange.endContainer.length)) {
                  // Insert the new paragraph after the current one
                  if (currentParagraph.nextSibling) {
                    cellContentDiv.insertBefore(newParagraph, currentParagraph.nextSibling);
                  } else {
                    cellContentDiv.appendChild(newParagraph);
                  }
                } else {
                  // Split the paragraph at the current selection
                  const range = document.createRange();
                  range.setStart(newRange.endContainer, newRange.endOffset);
                  range.setEndAfter(currentParagraph.lastChild);

                  // Extract the content after the cursor and put it in the new paragraph
                  const fragment = range.extractContents();
                  if (fragment.textContent.trim() !== '') {
                    newParagraph.innerHTML = '';
                    newParagraph.appendChild(fragment);
                  }

                  // Insert the new paragraph after the current one
                  if (currentParagraph.nextSibling) {
                    cellContentDiv.insertBefore(newParagraph, currentParagraph.nextSibling);
                  } else {
                    cellContentDiv.appendChild(newParagraph);
                  }
                }

                // Move the cursor to the beginning of the new paragraph
                const textNode = newParagraph.firstChild;
                newRange.setStart(textNode || newParagraph, 0);
                newRange.setEnd(textNode || newParagraph, 0);
                newSelection.removeAllRanges();
                newSelection.addRange(newRange);
              } else {
                // We're not inside a paragraph tag, so create a new one
                const p = document.createElement('p');
                p.innerHTML = '<br>';

                // Insert the paragraph at the current selection
                newRange.insertNode(p);

                // Move the cursor to the beginning of the new paragraph
                newRange.setStart(p.firstChild || p, 0);
                newRange.setEnd(p.firstChild || p, 0);
                newSelection.removeAllRanges();
                newSelection.addRange(newRange);
              }
            } else {
              // If there's no selection, append a new paragraph to the cell-content div
              const p = document.createElement('p');
              p.innerHTML = '<br>';
              cellContentDiv.appendChild(p);
            }

            // Update the editor content
            handleInput();
            return;
          }
        }
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();

      // Get clipboard data in different formats
      const html = e.clipboardData?.getData('text/html');
      const text = e.clipboardData?.getData('text/plain');

      // If HTML is available (like from Word, HWP, etc.), use it to preserve formatting
      if (html) {
        // Clean up the HTML to remove unwanted elements and styles
        const cleanHtml = cleanPastedHTML(html);
        executeCommand('insertHTML', cleanHtml);
      } else if (text) {
        // Fall back to plain text
        executeCommand('insertText', text);
      }
    };

    // Function to clean pasted HTML
    const cleanPastedHTML = (html) => {
      // Create a temporary div to hold the HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Remove potentially harmful elements
      const unwantedTags = ['script', 'style', 'meta', 'link', 'object', 'embed', 'iframe'];
      unwantedTags.forEach(tag => {
        const elements = temp.getElementsByTagName(tag);
        for (let i = elements.length - 1; i >= 0; i--) {
          elements[i].parentNode.removeChild(elements[i]);
        }
      });

      // Keep basic formatting and tables
      return temp.innerHTML;
    };

    const insertImage = (url) => {
      if (url) {
        // Create an image element to ensure it's loaded before inserting
        const img = new Image();
        img.onload = () => {
          executeCommand('insertHTML', `<img src="${url}" alt="Inserted image" style="max-width: 100%;" /><p><br></p>`);
          showImageDialog.value = false;
        };
        img.onerror = () => {
          alert('Failed to load image. Please check the URL and try again.');
        };
        img.src = url;
      }
    };

    const insertTable = (rows, cols, options) => {
      const { borderColor, cellPadding, borderWidth, cellWidth, cellHeight, includeHeader } = options || {};

      // Set default styles
      const border = borderColor || '#ddd';
      const padding = cellPadding || '8px';
      const bWidth = borderWidth || '1px';
      const width = cellWidth || '100px';
      const height = cellHeight || '40px';

      let tableHTML = `<table style="border-collapse: collapse; margin: 10px 0; position: relative;">`;

      // Create header row if requested
      if (includeHeader) {
        tableHTML += '<thead><tr>';
        for (let i = 0; i < cols; i++) {
          tableHTML += `<th style="border: ${bWidth} solid ${border}; padding: ${padding}; text-align: left; position: relative; width: ${width}; height: ${height}; overflow: hidden; word-wrap: break-word; white-space: normal;"></th>`;
        }
        tableHTML += '</tr></thead>';
      }

      // Create body
      tableHTML += '<tbody>';

      // Create data rows
      for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
          tableHTML += `<td style="border: ${bWidth} solid ${border}; padding: ${padding}; position: relative; width: ${width}; height: ${height}; overflow: hidden; word-wrap: break-word; white-space: normal;"></td>`;
        }
        tableHTML += '</tr>';
      }

      tableHTML += '</tbody></table>';

      // Focus the editor before inserting the table
      editorRef.value.focus();

      // Ensure we have a clean insertion point
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // If we're inside a table, move outside of it
        let inTable = false;
        let node = range.startContainer;
        while (node && node !== editorRef.value) {
          if (node.nodeName === 'TABLE') {
            inTable = true;
            break;
          }
          node = node.parentNode;
        }

        // If we're inside a table, move to the end of the editor content
        if (inTable) {
          const newRange = document.createRange();
          newRange.selectNodeContents(editorRef.value);
          newRange.collapse(false); // Collapse to end
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }

      // Now insert the table at the current selection followed by a line break
      executeCommand('insertHTML', tableHTML + '<p><br></p>');
      showTableDialog.value = false;

      // Make the new table resizable
      nextTick(() => {
        makeTablesResizable();

      });
    };

    const applyTableChanges = (options) => {
      if (!selectedElement.value) return;

      const table = selectedElement.value;

      // Apply cell width and height and ensure text doesn't overflow
      const cells = table.querySelectorAll('th, td');
      cells.forEach(cell => {
        if (options.cellWidth) {
          cell.style.width = options.cellWidth;
        }
        if (options.cellHeight) {
          cell.style.height = options.cellHeight;
        }
        // Ensure text doesn't overflow
        cell.style.overflow = 'hidden';
        cell.style.wordWrap = 'break-word';
        cell.style.whiteSpace = 'normal';
      });

      // Apply border width and color
      if (options.borderWidth || options.borderColor) {
        const borderWidth = options.borderWidth || table.style.borderWidth || '1px';
        const borderColor = options.borderColor || table.style.borderColor || '#ddd';

        // Apply to all cells and the table itself
        table.style.border = `${borderWidth} solid ${borderColor}`;

        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
          cell.style.border = `${borderWidth} solid ${borderColor}`;
        });
      }

      // Apply cell padding
      if (options.cellPadding) {
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
          cell.style.padding = options.cellPadding;
        });
      }

      // Apply zebra striping if enabled
      if (options.zebraStriping) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
          if (index % 2 === 0) {
            row.style.backgroundColor = options.evenRowColor || '#f9f9f9';
          } else {
            row.style.backgroundColor = options.oddRowColor || 'transparent';
          }
        });
      } else {
        // Remove zebra striping if disabled
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          row.style.backgroundColor = '';
        });
      }

      // Update content
      handleInput();

      // Close the dialog
      showTableEditDialog.value = false;

      // Make the table resizable again
      nextTick(() => {
        makeTablesResizable();
      });
    };

    const applyCellColor = (color) => {
      if (!selectedCell.value) return;

      // Apply the background color to the selected cell
      selectedCell.value.style.backgroundColor = color;

      // Update content
      handleInput();

      // Close the dialog
      showCellColorDialog.value = false;
    };

    const insertLink = (url, text, openInNewTab) => {
      if (url) {
        const selection = window.getSelection();
        const selectedText = selection && selection.toString();

        // Determine the text to use for the link
        const linkText = text || selectedText || url;

        // Create the target attribute if needed
        const target = openInNewTab ? ' target="_blank"' : '';

        // Create the link HTML
        const linkHTML = `<a href="${url}"${target}>${linkText}</a>`;

        // Insert the link
        executeCommand('insertHTML', linkHTML);
        showLinkDialog.value = false;
      }
    };

    // Handle toolbar click to ensure tables remain resizable
    const handleToolbarClick = () => {
      // Make tables resizable again with a small delay to ensure DOM has updated
      nextTick(() => {
        // Use setTimeout to ensure DOM has fully updated
        setTimeout(() => {
          makeTablesResizable();
          // Add another timeout to ensure table resizers are properly added
          setTimeout(() => {
            makeTablesResizable();
          }, 200);
        }, 200);
      });
    };


    return {
      editorRef,
      showImageDialog,
      showTableDialog,
      showTableEditDialog,
      showCellColorDialog,
      showLinkDialog,
      selectedElement,
      selectedCell,
      handleInput,
      handleBlur,
      executeCommand,
      handleKeyDown,
      handlePaste,
      insertImage,
      insertTable,
      applyTableChanges,
      applyCellColor,
      insertLink,
      editorContainerStyle,
      editorContentStyle,
      computedTheme,
      editorThemeClass,
      updateSelection,
      handleToolbarClick,
      checkSelectedElement,
      makeTablesResizable
    };
  }
};
</script>

<style>
/* 글로벌 - scoped 없음 */
</style>

<style scoped>

.vue-libre-editor .editor-content {
  overflow-y: auto;
}

.vue-libre-editor .editor-content[data-placeholder]:empty:before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
}

.vue-libre-editor .editor-content:focus {
  outline: none;
}

/* Table styles for the editor */
.vue-libre-editor .editor-content table {
  border-collapse: collapse;
  margin: 10px 0;
  position: relative;
}

.vue-libre-editor .editor-content th,
.vue-libre-editor .editor-content td {
  border: 1px solid #ddd;
  padding: 8px;
  position: relative;
  min-width: 30px;
  min-height: 20px;
}

.vue-libre-editor .editor-content tr:hover {
  background-color: #f5f5f5;
}

/* Column resizer styles */
.vue-libre-editor .column-resizer {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  background-color: transparent;
  cursor: col-resize;
  z-index: 1;
}

.vue-libre-editor .column-resizer:hover,
.vue-libre-editor .column-resizer:active {
  background-color: #2563eb;
}

/* Table resizer styles */
.vue-libre-editor .table-resizer {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 10px;
  height: 10px;
  background-color: #2563eb;
  border-radius: 50%;
  cursor: nwse-resize;
  z-index: 2;
}

/* When resizing is active */
.vue-libre-editor body.resizing {
  cursor: col-resize;
  user-select: none;
}

/* Dark theme adjustments for tables */
:deep(.editor-theme-dark) .vue-libre-editor .editor-content table td,
:deep(.editor-theme-dark) .vue-libre-editor .editor-content table th {
  border-color: #4b5563;
}

:deep(.editor-theme-dark) .vue-libre-editor .editor-content table tr:hover {
  background-color: #374151;
}

:deep(.editor-theme-dark) .vue-libre-editor .column-resizer:hover,
:deep(.editor-theme-dark) .vue-libre-editor .column-resizer:active,
:deep(.editor-theme-dark) .vue-libre-editor .table-resizer {
  background-color: #60a5fa;
}

/* Row resizer styles */
.vue-libre-editor .row-resizer {
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 6px;
  background-color: transparent;
  cursor: row-resize;
  z-index: 1;
}

.vue-libre-editor .row-resizer:hover,
.vue-libre-editor .row-resizer:active {
  background-color: #2563eb;
}

:deep(.editor-theme-dark) .vue-libre-editor .row-resizer:hover,
:deep(.editor-theme-dark) .vue-libre-editor .row-resizer:active {
  background-color: #60a5fa;
}

/* Cell selection styles */
.vue-libre-editor .cell-selected {
  background-color: rgba(37, 99, 235, 0.2) ;
  outline: 2px solid #2563eb ;
  position: relative;
  z-index: 1;
}

/* Multi-selected cells have a stronger highlight */
.vue-libre-editor .cell-selected[data-multi-selected="true"] {
  background-color: rgba(37, 99, 235, 0.3) ;
  outline: 3px solid #2563eb ;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.5);
}

/* Add a label to indicate multi-selection mode */
.vue-libre-editor .cell-selected[data-multi-selected="true"]::after {
  content: "";
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background-color: #2563eb;
  border-radius: 50%;
}

:deep(.editor-theme-dark) .vue-libre-editor .cell-selected {
  background-color: rgba(96, 165, 250, 0.2) ;
  outline: 2px solid #60a5fa ;
}

:deep(.editor-theme-dark) .vue-libre-editor .cell-selected[data-multi-selected="true"] {
  background-color: rgba(96, 165, 250, 0.3) ;
  outline: 3px solid #60a5fa ;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.5);
}

:deep(.editor-theme-dark) .vue-libre-editor .cell-selected[data-multi-selected="true"]::after {
  background-color: #60a5fa;
}

/* Styles for content when the module is not imported */
/* These styles can be exported and used separately */
.vue-libre-editor-content table {
  border-collapse: collapse;
  margin: 10px 0;
  position: relative;
  border-spacing: 0;
  width: auto;
  height: auto;
  table-layout: auto;
  caption-side: top;
  empty-cells: show;
  border: none;
  border-style: none;
  border-width: 0;
  border-color: currentColor;
  background-color: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  text-align: left;
  vertical-align: middle;
}

.vue-libre-editor .vue-libre-editor-content thead {
  vertical-align: middle;
  border-color: inherit;
  display: table-header-group;
}

.vue-libre-editor .vue-libre-editor-content tbody {
  vertical-align: middle;
  border-color: inherit;
  display: table-row-group;
}

.vue-libre-editor .vue-libre-editor-content tr {
  vertical-align: inherit;
  border-color: inherit;
  display: table-row;
}

.vue-libre-editor .vue-libre-editor-content a {
  color: #0000EE;
  text-decoration: underline;
  cursor: pointer;
  background-color: transparent;
}

.vue-libre-editor .vue-libre-editor-content img {
  border-style: none;
  max-width: 100%;
  height: auto;
  vertical-align: middle;
}

.vue-libre-editor .vue-libre-editor-content p {
  margin-top: 1em;
  margin-bottom: 1em;
  display: block;
}

.vue-libre-editor .vue-libre-editor-content button {
  appearance: button;
  text-transform: none;
  overflow: visible;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
  padding: 0;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
  cursor: pointer;
}

.vue-libre-editor .vue-libre-editor-content span {
  display: inline;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  line-height: inherit;
}

.vue-libre-editor .vue-libre-editor-content thead {
  vertical-align: middle;
  border-color: inherit;
  display: table-header-group;
}

.vue-libre-editor .vue-libre-editor-content tbody {
  vertical-align: middle;
  border-color: inherit;
  display: table-row-group;
}

.vue-libre-editor .vue-libre-editor-content tr {
  vertical-align: inherit;
  border-color: inherit;
  display: table-row;
}

.vue-libre-editor .vue-libre-editor-content a {
  color: #0000EE;
  text-decoration: underline;
  cursor: pointer;
  background-color: transparent;
}

.vue-libre-editor .vue-libre-editor-content img  {
  border-style: none;
  max-width: 100%;
  height: auto;
  vertical-align: middle;
}

.vue-libre-editor .vue-libre-editor-content p {
  margin-top: 1em;
  margin-bottom: 1em;
  display: block;
}

.vue-libre-editor .vue-libre-editor-content button {
  appearance: button;
  text-transform: none;
  overflow: visible;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
  padding: 0;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
  cursor: pointer;
}

.vue-libre-editor .vue-libre-editor-content span {
  display: inline;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  line-height: inherit;
}

.vue-libre-editor .vue-libre-editor-content table th,
.vue-libre-editor .vue-libre-editor-content table td {
  border: 1px solid #ddd;
  padding: 8px;
  position: relative;
  min-width: 30px;
  min-height: 20px;
  overflow: hidden;
  word-wrap: break-word;
  white-space: normal;
}

.vue-libre-editor .vue-libre-editor-content table tr:hover {
  background-color: #f5f5f5;
}

.vue-libre-editor .vue-libre-editor-content .cell-content {
  /* width is now set dynamically by JavaScript */
  height: 100%;
  position: relative;
  z-index: 0;
  overflow: hidden;
  word-wrap: break-word;
  white-space: normal;
}

/* Dark theme adjustments for content */
.vue-libre-editor .vue-libre-editor-content.dark-theme table td,
.vue-libre-editor .vue-libre-editor-content.dark-theme table th {
  border-color: #4b5563;
}

.vue-libre-editor .vue-libre-editor-content.dark-theme table tr:hover {
  background-color: #374151;
}
</style>
