# Vue Free Editor

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

## Usage

### Global Registration

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import VueLibreEditor from 'vue-libre-editor'

// Import the styles
import 'vue-libre-editor/dist/style.css'

const app = createApp(App)

// Register the component globally
app.use(VueLibreEditor)

app.mount('#app')
```

### Local Registration

```javascript
import { VueLibreEditor } from 'vue-libre-editor'
import 'vue-libre-editor/dist/style.css'

export default {
  components: {
    VueLibreEditor
  }
}
```

### Basic Example

```vue
<template>
  <div>
    <VueLibreEditor
      v-model="content"
      :config="editorConfig"
      placeholder="Start typing..."
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { VueLibreEditor } from 'vue-libre-editor'
import 'vue-libre-editor/dist/style.css'

export default {
  components: {
    VueLibreEditor
  },
  setup() {
    const content = ref('')
    const editorConfig = {
      theme: 'light', // or 'dark'
      size: {
        height: '400px',
        width: '100%',
        minHeight: '200px',
        maxHeight: '600px'
      },
      font: {
        family: 'Arial, sans-serif',
        size: '16px'
      }
    }

    return {
      content,
      editorConfig
    }
  }
}
</script>
```

### Using the Content Outside the Editor

There are two ways to display the content outside the editor:

#### 1. Using the CSS File

Import the CSS file and apply the class to your content:

Then, display the content in your template:

```vue
<template>
  <div v-html="content" class="vue-libre-editor-content"></div>
</template>
```

#### 2. Using the VueLibreEditorGenerator Function

For more flexibility, you can use the `VueLibreEditorGenerator` function to wrap your content with the necessary styles:

```javascript
import { VueLibreEditorGenerator } from 'vue-libre-editor/lib/generate'

export default {
  setup() {
    const content = ref('<p>Hello, this is my content</p>')

    // Create a computed property that transforms the content
    const formattedContent = computed(() => {
      return VueLibreEditorGenerator(content.value)
    })

    return {
      content,
      formattedContent
    }
  }
}
```

Then, display the formatted content in your template:

```vue
<template>
  <div v-html="formattedContent"></div>
</template>
```

This approach automatically adds the necessary class and inline styles to ensure your content displays correctly, even without importing the CSS file.

## Configuration Options

The editor accepts a `config` prop with the following options:

```javascript
const config = {
  // Theme: 'light', 'dark', or 'none' (for custom theme)
  theme: 'light',

  // Size configuration
  size: {
    width: '100%',
    height: '400px',
    minWidth: '200px', 
    minHeight: '200px',
    maxWidth: '1000px',
    maxHeight: '800px',
  },

  // Font configuration
  font: {
    family: 'Arial, sans-serif',
    size: '16px'
  },

  // Custom theme configuration (when theme is 'none')
  theme: {
    headerBgColor: '#f3f4f6',
    headerFgColor: '#111827',
    contentBgColor: '#ffffff',
    contentFgColor: '#111827',
    edgeColor: '#d1d5db',
    activeButtonBg: '#e5e7eb',
    activeButtonFg: '#2563eb'
  }
}
```

## Dependencies

The editor uses the following dependencies:
- Vue 3
- TailwindCSS
- Other UI-related packages for styling and functionality

## License

MIT
