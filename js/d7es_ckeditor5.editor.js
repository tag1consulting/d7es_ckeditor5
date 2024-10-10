import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  Essentials,
  FindAndReplace,
  Italic,
  Font,
  Paragraph,
  Link,
  List,
  Underline,
  Strikethrough,
  Table,
  HorizontalLine,
  Heading,
  SourceEditing,
  GeneralHtmlSupport,
} from 'ckeditor5';

// @todo: maybe this should be done server side using importmap.
async function importPlugins(plugins) {
  const importedPlugins = {
    'plugins': [],
    'buttons': [],
  };
  for (let i = 0; i < plugins.length; i++) {
    const module = await import(plugins[i].path);
    importedPlugins.plugins.push(module[plugins[0].name]);
    if (plugins[0].button) {
      importedPlugins.buttons.push(plugins[0].button);
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

        importPlugins(settings.d7es_ckeditor5.plugins).then((importedPlugins) => {
          /* @todo: should be a configuration with UI */
          const plugins = [...importedPlugins.plugins, ...[
            Essentials,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Font,
            Paragraph,
            Alignment,
            BlockQuote,
            Code,
            FindAndReplace,
            Link,
            List,
            Table,
            HorizontalLine,
            Heading,
            SourceEditing,
            GeneralHtmlSupport,
          ]];

          /**
           * Missing features:
           *   - Unlink button (you should use the link one)
           *   - Anchor
           */
          editors.forEach(editor => {
            ClassicEditor
              .create(editor, {
                htmlSupport: {
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
                plugins: plugins,
                /* @todo: should be a configuration with UI */
                toolbar: [...[
                  'undo',
                  'redo',
                  '|',
                  'heading',
                  '|',
                  'bold',
                  'italic',
                  'underline',
                  'strikethrough',
                  'code',
                  'blockQuote',
                  '|',
                  'link',
                  '|',
                  'numberedList',
                  'bulletedList',
                  'alignment',
                  'insertTable',
                  'horizontalLine',
                  '|',
                  'sourceEditing',
                ], ...importedPlugins.buttons],
                licenseKey: settings.ckeditor5?.licenseKey,
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
