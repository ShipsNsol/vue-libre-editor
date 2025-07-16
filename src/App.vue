<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Vue 3 WYSIWYG Editor</h1>

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Editor Configuration:</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Width:</label>
          <input 
            type="text" 
            v-model="config.size.width" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 100%, 800px"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Height:</label>
          <input 
            type="text" 
            v-model="config.size.height" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 400px, 50vh"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Min Width:</label>
          <input 
            type="text" 
            v-model="config.size.minWidth" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 300px"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Max Width:</label>
          <input 
            type="text" 
            v-model="config.size.maxWidth" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 1200px"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Min Height:</label>
          <input 
            type="text" 
            v-model="config.size.minHeight" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 200px"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Max Height:</label>
          <input 
            type="text" 
            v-model="config.size.maxHeight" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 600px"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Font Family:</label>
          <input 
            type="text" 
            v-model="config.font.family" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Arial, sans-serif"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Font Size:</label>
          <input 
            type="text" 
            v-model="config.font.size" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 16px, 1.2rem"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Theme:</label>
          <select 
            v-model="selectedTheme" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            @change="updateTheme"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="none">Custom</option>
          </select>
        </div>
      </div>

      <!-- Custom theme options -->
      <div v-if="selectedTheme === 'none'" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Header Background Color:</label>
          <input 
            type="text" 
            v-model="config.theme.headerBgColor" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="#f3f4f6"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Header Text Color:</label>
          <input 
            type="text" 
            v-model="config.theme.headerFgColor" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="#111827"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Content Background Color:</label>
          <input 
            type="text" 
            v-model="config.theme.contentBgColor" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="#ffffff"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Content Text Color:</label>
          <input 
            type="text" 
            v-model="config.theme.contentFgColor" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="#111827"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Border Color:</label>
          <input 
            type="text" 
            v-model="config.theme.edgeColor" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="#d1d5db"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Active Button Background:</label>
          <input 
            type="text" 
            v-model="config.theme.activeButtonBg" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="#e5e7eb"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Active Button Text Color:</label>
          <input 
            type="text" 
            v-model="config.theme.activeButtonFg" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="#2563eb"
          />
        </div>
      </div>
      
      <!-- CSS Variables Testing Section -->
      <div class="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50">
        <h3 class="text-lg font-semibold mb-3">CSS Variables Testing</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Spacing:</label>
            <input 
              type="text" 
              v-model="customCssVars['--spacing']" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 4rem, .25rem"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Container Width:</label>
            <input 
              type="text" 
              v-model="customCssVars['--container-md']" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 44.8rem, 28rem"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Small Text Size:</label>
            <input 
              type="text" 
              v-model="customCssVars['--text-sm']" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 1.4rem, .875rem"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Small Text Line Height:</label>
            <input 
              type="text" 
              v-model="customCssVars['--text-sm--line-height']" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., calc(2 / 1.4), calc(1.25 / .875)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Large Text Size:</label>
            <input 
              type="text" 
              v-model="customCssVars['--text-lg']" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 1.8rem, 1.125rem"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Large Text Line Height:</label>
            <input 
              type="text" 
              v-model="customCssVars['--text-lg--line-height']" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., calc(2.8 / 1.8), calc(1.75 / 1.125)"
            />
          </div>
        </div>
        
        <div class="mt-4">
          <p class="text-sm text-gray-600">
            Current CSS Variables:
          </p>
          <pre class="mt-2 p-3 bg-gray-100 rounded-md text-xs overflow-x-auto">{{ JSON.stringify(cssVars, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <VueLibreEditor
      v-model="content" 
      placeholder="Start typing here..."
      :config="config"
      :cssVars="cssVars"
      class="mb-8"
    />

    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-2">Editor Content:</h2>
      <div class="p-4 bg-gray-100 rounded-md">
        <div v-html="formattedContent"></div>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-2">Raw HTML:</h2>
      <pre class="p-4 bg-gray-100 rounded-md overflow-x-auto whitespace-pre-wrap">{{ content }}</pre>
    </div>

    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-2">Current Configuration:</h2>
      <pre class="p-4 bg-gray-100 rounded-md overflow-x-auto whitespace-pre-wrap">{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import VueLibreEditor from './components/VueLibreEditor.vue';
import { VueLibreEditorGenerator } from './lib/generate.js';

  export default {
    components: {
      VueLibreEditor
    },
    setup() {
      const content = ref('<p>Hello, this is a <strong>WYSIWYG</strong> editor for <em>Vue 3</em>!</p>');
      const selectedTheme = ref('light');

      const config = reactive({
                                size: {
                                  width: '100%',
                                  height: '800px',
                                  // minWidth: '300px',
                                  // maxWidth: '100%',
                                  // minHeight: '300px',
                                  // maxHeight: '600px'
                                },
                                font: {
                                  family: 'Arial, sans-serif',
                                  size: '16px'
                                },
                                theme: 'light'
                              });

      // Custom CSS variables for when custom theme is selected
      const customCssVars = reactive({
         '--spacing': '.25rem',
         '--container-md': '28rem',
         '--text-sm': '.875rem',
         '--text-sm--line-height': 'calc(1.25 / .875)',
         '--text-lg': '1.125rem',
         '--text-lg--line-height': 'calc(1.75 / 1.125)',
      });

      
      // Computed property to determine the final CSS variables
      const cssVars = computed(() => {
        return customCssVars;
      });

      const updateTheme = () => {
        if (selectedTheme.value === 'none') {
          // Initialize custom theme if not already set
          if (typeof config.theme !== 'object') {
            config.theme = {
              headerBgColor: '#f3f4f6',
              headerFgColor: '#111827',
              contentBgColor: '#ffffff',
              contentFgColor: '#111827',
              edgeColor: '#d1d5db',
              activeButtonBg: '#e5e7eb',
              activeButtonFg: '#2563eb'
            };
          }
        } else {
          // Set predefined theme
          config.theme = selectedTheme.value;
        }
      };

      // Computed property that transforms the content using VueLibreEditorGenerator
      const formattedContent = computed(() => {
        return VueLibreEditorGenerator(content.value);
      });

      return {
        content,
        formattedContent,
        config,
        selectedTheme,
        updateTheme,
        // CSS Variables Testing
        customCssVars,
        cssVars
      };
    }
};
</script>