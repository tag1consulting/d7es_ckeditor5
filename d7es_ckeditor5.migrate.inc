<?php

use Drupal\d7es_ckeditor5\Profile;

function d7es_ckeditor5_configuration_migrate() {
  $map = [
    'Format' => ['Heading', 'heading'],
    'Bold' => ['Bold', 'bold'],
    'Italic' => ['Italic', 'italic'],
    'Underline' => ['Underline', 'underline'],
    'Strike' => ['Strikethrough', 'strikethrough'],
    'CodeSnippet' => ['Code', 'code'],
    'Blockquote' => ['BlockQuote', 'blockQuote'],
    'Link' => ['Link', 'link'],
    'Unlink' => ['Link', 'link'],
    'Anchor' => ['Link', 'link'],
    'NumberedList' => ['List', 'numberedList'],
    'BulletedList' => ['List', 'bulletedList'],
    'JustifyCenter' => ['Alignment', 'alignment'],
    'JustifyLeft', ['Alignment', 'alignment'],
    'JustifyRight' => ['Alignment', 'alignment'],
    'JustifyBlock', ['Alignment', 'alignment'],
    'Table' => ['Table', 'insertTable'],
    'HorizontalRule' => ['HorizontalLine', 'horizontalLine'],
  ];

  module_load_include('inc', 'ckeditor', 'includes/ckeditor.lib');

  $profiles = ckeditor_profile_load();
  if (!empty($profiles)) {
    foreach ($profiles as $profile) {
      $configuration = [];
      if (!empty($profile->settings['toolbar'])) {
        $id = drupal_html_id($profile->name);
        $toolbar = str_replace("'", '"', $profile->settings['toolbar']);
        $toolbar = trim($toolbar);
        $toolbars_array = drupal_json_decode($toolbar);
        if (!empty($toolbars_array)) {
          foreach ($toolbars_array as $group => $toolbar_items) {
            if (is_array($toolbar_items)) {
              foreach ($toolbar_items as $toolbar_item) {
                if (isset($map[$toolbar_item])) {
                  [$plugin, $button] = $map[$toolbar_item];
                  $configuration['plugins']['ckeditor5'][] = $plugin;
                  $configuration['buttons'][$group][] = $button;
                }
              }
            }
          }

          $configuration['plugins']['ckeditor5'] = array_values(array_unique($configuration['plugins']['ckeditor5']));
          $configuration['buttons'] = array_values(array_map(fn($group) => array_values(array_unique($group)), $configuration['buttons']));
          $ckeditor5_profile = new Profile($id);
          $ckeditor5_profile->setConfiguration(['name' => $profile->name] + $configuration);
          $ckeditor5_profile->save();

          if (!empty($profile->input_formats)) {
            foreach ($profile->input_formats as $format) {
              db_merge('d7es_ckeditor5_input_format')
                ->key(['id' => $id])
                ->fields(['format' => $format])
                ->execute();
            }
          }
        }
      }
    }
  }
}
