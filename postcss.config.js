import prefixwrap from 'postcss-prefixwrap';

export default {
  plugins: [
    prefixwrap('.vue-libre-editor-root', {
      // Don't prefix selectors that already have the root class
      ignoredSelectors: [
        '.vue-libre-editor-root',
        /^\.vue-libre-editor-root/,
        // Don't prefix Vue scoped selectors (they're already scoped)
        /\[data-v-[a-f0-9]+\]/,
        // Don't prefix keyframes and other at-rules
        /@/
      ],
      // Prefix nested selectors properly
      prefixRootTags: true
    })
  ]
};