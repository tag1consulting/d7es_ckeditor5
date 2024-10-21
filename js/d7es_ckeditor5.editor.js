import { ClassicEditor, SourceEditing, Essentials } from 'ckeditor5';

export const CKEDITOR5 = {
  instances: [],
};

/**
 * Async import plugins.
 *
 * @param plugins
 * @returns {Promise<*[]>}
 */
async function importPlugins(plugins) {
  const importedPlugins = [];
  const keys = Object.keys(plugins);
  for (let i = 0; i < keys.length; i++) {
    const moduleName = keys[i];
    const module = await import(moduleName);
    for (let j = 0; j < plugins[moduleName].length; j++) {
      importedPlugins.push(module[plugins[moduleName][j]]);
    }
  }
  return importedPlugins;
}

((Drupal) => {
  Drupal.behaviors.d7esCkeditor5Editor = {
    ckeditorSettings: null,
    /**
     * Create a CKEditor5 instance.
     *
     * @param element
     * @param format
     */
    createEditor: function(element, format) {
      const that = this;

      const editorSettings = that.ckeditorSettings[format];
      if (!editorSettings) {
        return;
      }

      const toolbar = ['undo', 'redo'];
      importPlugins(editorSettings.plugins).then(plugins => {
        editorSettings.buttons.forEach(buttons => {
          toolbar.push('|');
          buttons.forEach(button => {
            toolbar.push(button);
          });
        });

        ClassicEditor
          .create(element, {
            htmlSupport: {
              allow: [
                {
                  name: /.*/,
                  attributes: true,
                  classes: true,
                  styles: true
                }
              ]
            },
            plugins: [...plugins, ...[Essentials, SourceEditing]],
            toolbar: [...toolbar, ...['|', 'sourceEditing']],
            licenseKey: editorSettings?.licenseKey,
          })
          // Set the editor initial height.
          // @todo: make the height configurable.
          .then((editor) => {
            CKEDITOR5.instances[element.getAttribute('name')] = editor;
            editor.editing.view.change(writer => {
              writer.setStyle('height', '300px', editor.editing.view.document.getRoot());
            });
          })
          .catch( /* ... */);
      });
    },
    /**
     * Behaviors attach handler.
     *
     * @param context
     * @param settings
     */
    attach: function(context, settings) {
      const that = this;

      const elements = document.querySelectorAll('[d7es-ckeditor5-enabled]');
      if (elements.length === 0) {
        return;
      }

      if (!document.body.classList.contains('d7es-ckeditor5-processed')) {
        document.body.classList.add('d7es-ckeditor5-processed');
        that.ckeditorSettings = settings.d7es_ckeditor5;

        elements.forEach(element => {
          const elementName = element.getAttribute('name');

          // Get the CKEditor5 current format configuration if any.
          const format = that.ckeditorSettings.textarea_default_format[elementName];
          if (!format) {
            return;
          }

          const regex = /^(\w+\[\w+\]\[\d+\])(\[\w+\])$/gm;
          const matches = regex.exec(elementName);

          if (matches) {
            const formatSelect = document.querySelector(`[name="${matches[1]}[format]"]`);
            if (formatSelect) {
              formatSelect.addEventListener('change', e => {
                const select = e.target;
                const selected = select.options[select.selectedIndex].value;
                const editor = CKEDITOR5.instances[elementName];
                if (editor) {
                  editor.destroy();
                  delete CKEDITOR5.instances[elementName];
                }
                that.createEditor(element, selected);
              });
            }
          }

          that.createEditor(element, format);
        });
      }
    }
  };
})(window.Drupal);
