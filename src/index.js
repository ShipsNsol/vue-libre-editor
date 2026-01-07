import VueLibreEditor from '../../VueLibreEditor/src/components/VueLibreEditor.vue';

// Export the component as default
export default VueLibreEditor;

// Named export for more flexibility
export { VueLibreEditor };

// Install function for Vue.use()
export function install(app) {
  app.component('VueLibreEditor', VueLibreEditor);
  return app;
}
