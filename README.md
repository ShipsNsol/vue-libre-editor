# Vue Libre Editor

## Project Background

이 위즈윅 에디터는 90% 이상 AI로 작성된 코드입니다. 무료 에디터가 필요하신분은 편히 쓰십시오.
추가적으로 제가 필요할시에만 업데이트는 진행할 예정입니다.

이 에디터를 만든 목적은 대부분의 위즈윅 에디터는 무료로 제공되지않습니다.

무료라고 적어두고 로컬호스트에서만 무료로 사용할 수 있게 되어있습니다.

또한 영구라이센스도 거의 없으며 가격이 매우 불합리적이라고 생각해서 만들게 되었습니다.

This WYSIWYG editor is written over 90% by AI. Feel free to use it if you need a free editor.
Updates will only be made when I personally need them.

The purpose of creating this editor is that most WYSIWYG editors are not provided for free.

Even when they claim to be "free" they are only free for localhost usage.

Additionally, there are hardly any perpetual licenses available, and I believe the pricing is very unreasonable, which led me to create this.

(Translate by AI)


## Features

- 간단한 서식기능이 포함되어있음(Rich text editing with formatting options)
- 테이블 크기조절 지원(Table support with resizing)
- 이미지경로삽입가능(Image insertion)
- 링크삽입가능(Link insertion)
- 테마선택가능(라이트모드/다크모드/커스텀모드)(Customizable themes (light/dark))
- 반응형 디자인(Responsive design)
- 표 셀및 선 색상 선택가능(Table cell editing and formatting)
- 독자적인 CSS파일없이 뷰어용 html코드로 생성가능(Content generation with proper styling)

## Installation

```bash
npm install vue-libre-editor
```

or

```bash
yarn add vue-libre-editor
```

## Usage

> **Important:** Always import the CSS file along with the component. Without the CSS, the editor will not display correctly.

### Global Registration

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import VueLibreEditor from 'vue-libre-editor'
import 'vue-libre-editor/dist/vue-libre-editor.css' // Required for proper styling

const app = createApp(App)
app.use(VueLibreEditor)
app.mount('#app')
```

### Local Registration

```vue
<template>
  <div>
    <h1>My Editor</h1>
    <VueLibreEditor v-model="content" :config="config" />

    <!-- Display the formatted content -->
    <div v-html="formattedContent"></div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { VueLibreEditor } from 'vue-libre-editor'
import { VueLibreEditorGenerator } from 'vue-libre-editor/lib/generate'
import 'vue-libre-editor/dist/vue-libre-editor.css' // Required for proper styling

export default {
  components: {
    VueLibreEditor
  },
  setup() {
    const content = ref('<p>Hello, world!</p>');

    // Editor configuration
    const config = reactive({
      size: {
        width: '100%',
        height: '400px',
        minHeight: '200px',
      },
      font: {
        family: 'Arial, sans-serif',
        size: '16px'
      },
      theme: 'light' // 'light', 'dark', or custom theme object
    });

    // Use the generator to properly format the content for display
    const formattedContent = computed(() => {
      return VueLibreEditorGenerator(content.value);
    });

    return {
      content,
      config,
      formattedContent
    };
  }
}
</script>
```

### Important Note About Content Display

When displaying the editor content outside the editor, you should use the `VueLibreEditorGenerator` function to properly wrap the content with necessary styles:

```javascript
import { VueLibreEditorGenerator } from 'vue-libre-editor/lib/generate'

// In your component:
const formattedContent = computed(() => {
  return VueLibreEditorGenerator(content.value);
});
```

This ensures that tables and other formatted elements display correctly even outside the editor.

### Complete Example with Configuration

Here's a more complete example showing various configuration options:

```vue
<template>
  <div>
    <h1>WYSIWYG Editor</h1>

    <!-- Editor Configuration Controls -->
    <div class="config-panel">
      <div>
        <label>Width:</label>
        <input v-model="config.size.width" placeholder="e.g., 100%, 800px" />
      </div>
      <div>
        <label>Height:</label>
        <input v-model="config.size.height" placeholder="e.g., 400px, 50vh" />
      </div>
      <div>
        <label>Theme:</label>
        <select v-model="selectedTheme" @change="updateTheme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="none">Custom</option>
        </select>
      </div>
    </div>

    <!-- The Editor -->
    <VueLibreEditor
      v-model="content" 
      placeholder="Start typing here..."
      :config="config"
    />

    <!-- Display the formatted content -->
    <div>
      <h2>Formatted Content:</h2>
      <div v-html="formattedContent"></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { VueLibreEditor } from 'vue-libre-editor'
import { VueLibreEditorGenerator } from 'vue-libre-editor/lib/generate'
import 'vue-libre-editor/dist/vue-libre-editor.css'

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
        height: '400px',
        minHeight: '200px',
      },
      font: {
        family: 'Arial, sans-serif',
        size: '16px'
      },
      theme: 'light'
    });

    const updateTheme = () => {
      if (selectedTheme.value === 'none') {
        // Initialize custom theme
        config.theme = {
          headerBgColor: '#f3f4f6',
          headerFgColor: '#111827',
          contentBgColor: '#ffffff',
          contentFgColor: '#111827',
          edgeColor: '#d1d5db',
          activeButtonBg: '#e5e7eb',
          activeButtonFg: '#2563eb'
        };
      } else {
        // Set predefined theme
        config.theme = selectedTheme.value;
      }
    };

    // Use the generator to properly format the content for display
    const formattedContent = computed(() => {
      return VueLibreEditorGenerator(content.value);
    });

    return {
      content,
      formattedContent,
      config,
      selectedTheme,
      updateTheme
    };
  }
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | String | '' | The HTML content of the editor (v-model) |
| placeholder | String | 'Type something...' | Placeholder text when editor is empty |
| height | String | 'auto' | Height of the editor |
| minHeight | String | '200px' | Minimum height of the editor |
| maxHeight | String | 'none' | Maximum height of the editor |
| theme | String | 'light' | Theme of the editor ('light', 'dark', or 'auto') |
| editable | Boolean | true | Whether the editor is editable |
| toolbar | Boolean | true | Whether to show the toolbar |
| customClass | String | '' | Custom CSS class to add to the editor |
| sanitize | Boolean | true | Whether to sanitize HTML input |
| allowedTags | Array | [...] | Array of allowed HTML tags |
| allowedAttributes | Object | {...} | Object of allowed HTML attributes |
| cssVars | Object | {} | Custom CSS variables for theming (see CSS Variables section) |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| update:modelValue | content | Emitted when the content changes |
| change | content | Emitted when the content changes |
| blur | editor | Emitted when the editor loses focus |
| focus | editor | Emitted when the editor gains focus |
| ready | editor | Emitted when the editor is ready |

## CSS Variables Customization

You can customize the CSS variables used in the editor by using the `cssVars` prop. This allows you to change the spacing, font sizes, and other styling aspects of the editor.

### Available CSS Variables

| Variable                             | Default Value                                                                                      | Description                                 |
|--------------------------------------|----------------------------------------------------------------------------------------------------|---------------------------------------------|
| --spacing                            | .25rem                                                                                             | Controls spacing throughout the editor      |
| --container-md                       | 28rem                                                                                              | Controls medium container width             |
| --text-sm                            | .875rem                                                                                            | Controls small text size                    |
| --text-sm--line-height               | calc(1.25 / .875)                                                                                  | Controls small text line height             |
| --text-lg                            | 1.125rem                                                                                           | Controls large text size                    |
| --text-lg--line-height               | calc(1.75 / 1.125)                                                                                 | Controls large text line height             |
| --font-weight-medium                 | 500                                                                                                | Controls medium font weight                 |
| --font-mono                          | ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace | Controls monospace font family              |
| --default-mono-font-family           | var(--font-mono)                                                                                   | Controls default monospace font family      |
| --default-transition-duration        | .15s                                                                                               | Controls default transition duration        |
| --default-transition-timing-function | cubic-bezier(.4, 0, .2, 1)                                                                         | Controls default transition timing function |

### Theme Size Options

The editor supports two predefined theme sizes:

1. **Large Theme** (Default): Uses larger spacing and font sizes, suitable for content-focused applications.
2. **Small Theme**: Uses smaller spacing and font sizes, better for compact UIs.

You can also create a custom theme by providing your own values for the CSS variables.

### Example Usage

#### Large Theme (Default)

The large theme is applied by default, but you can explicitly set it:

```vue
<template>
  <VueLibreEditor
    v-model="content"
    :config="config"
    :cssVars="largeThemeVars"
  />
</template>

<script>
import { ref, reactive } from 'vue';
import { VueLibreEditor } from 'vue-libre-editor'
import 'vue-libre-editor/dist/vue-libre-editor.css'

export default {
  components: {
    VueLibreEditor
  },
  setup() {
    const content = ref('<p>Hello, world!</p>');
    
    const config = reactive({
      // Your regular config here
    });
    
    // Large theme CSS variables (these are the default values)
    const largeThemeVars = {
      '--spacing': '4rem',
      '--container-md': '44.8rem',
      '--text-sm': '1.4rem',
      '--text-sm--line-height': 'calc(2 / 1.4)',
      '--text-lg': '1.8rem',
      '--text-lg--line-height': 'calc(2.8 / 1.8)'
    };
    
    return {
      content,
      config,
      largeThemeVars
    };
  }
}
</script>
```

#### Small Theme

To use the small theme, provide the small theme CSS variables:

```vue
<template>
  <VueLibreEditor
    v-model="content"
    :config="config"
    :cssVars="smallThemeVars"
  />
</template>

<script>
import { ref, reactive } from 'vue';
import { VueLibreEditor } from 'vue-libre-editor'
import 'vue-libre-editor/dist/vue-libre-editor.css'

export default {
  components: {
    VueLibreEditor
  },
  setup() {
    const content = ref('<p>Hello, world!</p>');
    
    const config = reactive({
      // Your regular config here
    });
    
    // Small theme CSS variables
    const smallThemeVars = {
      '--spacing': '.25rem',
      '--container-md': '28rem',
      '--text-sm': '.875rem',
      '--text-sm--line-height': 'calc(1.25 / .875)',
      '--text-lg': '1.125rem',
      '--text-lg--line-height': 'calc(1.75 / 1.125)'
    };
    
    return {
      content,
      config,
      smallThemeVars
    };
  }
}
</script>
```

#### Custom Theme

You can also create a custom theme by providing your own values:

```vue
<template>
  <VueLibreEditor
    v-model="content"
    :config="config"
    :cssVars="customCssVars"
  />
</template>

<script>
import { ref, reactive } from 'vue';
import { VueLibreEditor } from 'vue-libre-editor'
import 'vue-libre-editor/dist/vue-libre-editor.css'

export default {
  components: {
    VueLibreEditor
  },
  setup() {
    const content = ref('<p>Hello, world!</p>');
    
    const config = reactive({
      // Your regular config here
    });
    
    // Custom CSS variables
    const customCssVars = {
      '--spacing': '2rem',
      '--container-md': '36rem',
      '--text-sm': '1.2rem',
      '--text-sm--line-height': 'calc(1.8 / 1.2)',
      '--text-lg': '1.5rem',
      '--text-lg--line-height': 'calc(2.2 / 1.5)'
    };
    
    return {
      content,
      config,
      customCssVars
    };
  }
}
</script>
```

## License

MIT

## Author

ShipsNsol
