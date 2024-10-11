import { ClassicEditor, SourceEditing, Essentials } from 'ckeditor5';

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

(function(Drupal) {
  Drupal.behaviors.d7esCkeditor5Editor = {
    attach: function (context, settings) {
      const editors = document.querySelectorAll('.text-full');
      if (editors.length === 0) {
        return;
      }

      if (!document.body.classList.contains('d7es-ckeditor5-processed')) {
        document.body.classList.add('d7es-ckeditor5-processed');

        const toolbar = ['undo', 'redo'];

        settings.d7es_ckeditor5.filtered_html.buttons.forEach(buttons => {
          toolbar.push('|');
          buttons.forEach(button => {
            toolbar.push(button);
          });
        });

        importPlugins(settings.d7es_ckeditor5.filtered_html.plugins).then(plugins => {
          /**
           * Missing features:
           *   - Unlink button (you should use the link one)
           *   - Anchor
           */
          editors.forEach(editor => {
            ClassicEditor
              .create(editor, {
                htmlSupport: {
                  /* @todo; allowed tags configuration */
                  allow: [
                    {
                      name: /.*/,
                      attributes: true,
                      classes: true,
                      styles: true
                    },
                  ],
                  disallow: [ /* HTML features to disallow. */ ]
                },
                plugins: [...plugins, ...[Essentials, SourceEditing]],
                /* @todo: should be a configuration with UI */
                toolbar: [...toolbar, ...['sourceEditing']],
                licenseKey: settings.d7es_ckeditor5?.licenseKey,
              })
              // Set the editor initial height.
              // @todo: make the height configurable.
              .then((editor) => {
                editor.editing.view.change(writer => {
                  writer.setStyle('height', '300px', editor.editing.view.document.getRoot());
                });
              })
              .catch( /* ... */ );
          });
        });
      }
    }
  };
})(window.Drupal);
