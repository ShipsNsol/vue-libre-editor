/**
 * Utility functions for generating styled content from the editor
 */

/**
 * Wraps the given content with the vue-libre-editor-content class and inline styles
 * @param {string} content - The raw editor content to wrap
 * @returns {string} - The wrapped content with styles
 */
export const VueLibreEditorGenerator = (content) => {
  // Create a temporary div to manipulate the content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Add the vue-libre-editor-content class to the content
  tempDiv.classList.add('vue-libre-editor-content');

  // Include essential styles inline to ensure content displays correctly without external CSS
  const inlineStyles = `<style>.vue-libre-editor-content table{border-collapse:collapse;margin:10px 0;position:relative}.vue-libre-editor-content table th,.vue-libre-editor-content table td{border:1px solid #ddd;padding:8px;position:relative;min-width:30px;min-height:20px;overflow:hidden;word-wrap:break-word;white-space:normal}.vue-libre-editor-content table tr:hover{background-color:#f5f5f5}.vue-libre-editor-content .cell-content{height:100%;position:relative;z-index:0;overflow:hidden;word-wrap:break-word;white-space:normal}.vue-libre-editor-content.dark-theme table td,.vue-libre-editor-content.dark-theme table th{border-color:#4b5563}.vue-libre-editor-content.dark-theme table tr:hover{background-color:#374151}</style>`;

  // Add the inline styles to the beginning of the content
  tempDiv.innerHTML = inlineStyles + tempDiv.innerHTML;

  return tempDiv.outerHTML;
};