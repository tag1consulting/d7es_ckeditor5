<?php

function d7es_ckeditor5_configuration_migrate() {
  $map = [
    'Styles' => 'Heading',
    'Bold' => 'Bold',
    'Italic' => 'Italic',
    'Underline' => 'Underline',
    'Strike' => 'Strikethrough',
    'CodeSnippet' => 'Code',
    'Blockquote' => 'BlockQuote',
    'Link' => 'Link',
    'Unlink' => 'Link',
    'Anchor' => 'Link',
    'NumberedList' => 'List', // numberedList
    'BulletedList' => 'List', // bulletedList
    'JustifyCenter' => 'Alignment',
    'JustifyLeft' => 'Alignment',
    'JustifyRight' => 'Alignment',
    'JustifyBlock' => 'Alignment',
    'Table' => 'Table', // InsertTable
    'HorizontalRule' => 'HorizontalLine',
  ];

  module_load_include('inc', 'ckeditor', 'includes/ckeditor.lib');
  $configuration = [];
  $added_modules = [];
  $formats = filter_formats();
  if (!empty($formats)) {
    foreach ($formats as $format) {
      $profile = ckeditor_get_profile($format->format);
      if (!empty($profile->settings['toolbar'])) {
        $profiles[$format->format] = $profile;
        $toolbar = str_replace("'", '"', $profile->settings['toolbar']);
        $toolbar = trim($toolbar);
        $toolbars_array = drupal_json_decode($toolbar, true);
        if (!empty($toolbars_array)) {
          foreach ($toolbars_array as $group => $toolbar_items) {
            foreach ($toolbar_items as $toolbar_item) {
              if (isset($map[$toolbar_item])) {
                if (!in_array($map[$toolbar_item], $added_modules)) {
                  $added_modules[$map[$toolbar_item]] = $map[$toolbar_item];
                  $configuration[$format->format]['plugins']['ckeditor5'][] = $map[$toolbar_item];
                  $configuration[$format->format]['buttons'][$group][] = lcfirst(ucwords($map[$toolbar_item]));
                }
              }
            }
          }
        }
      }
    }
  }

  variable_set('d7es_ckeditor5_settings', $configuration);
}
