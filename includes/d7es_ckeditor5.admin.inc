<?php

use Drupal\d7es_ckeditor5\Profile;

function d7es_ckeditor5_configuration_form($form, $form_state) {
  $profiles = db_select('d7es_ckeditor5_settings', 'dcs')
    ->fields('dcs', ['id', 'id'])
    ->execute()
    ->fetchAllKeyed();

  $form['profiles'] = [
    '#type' => 'container',
    '#tree' => TRUE,
  ];

  if (!empty($profiles)) {
    foreach ($profiles as $profile_id) {
      $profile = new Profile($profile_id);

      $form['profiles'][$profile->getID()]['settings'] = [
        '#type' => 'textarea',
        '#default_value' => drupal_json_encode($profile->getConfiguration()),
        '#title' => $profile->getName(),
      ];

      $formats = filter_formats();
      $profile_formats = $profile->getFormats();
      if (!empty($formats)) {
        $form['profiles'][$profile->getID()]['formats'] = [
          '#type' => 'container',
          '#tree' => TRUE,
        ];

        foreach ($formats as $format) {
          $form['profiles'][$profile->getID()]['formats'][$format->format] = [
            '#type' => 'checkbox',
            '#title' => $format->name,
            '#default_value' => in_array($format->format, $profile_formats),
          ];
        }
      }
    }
  }

  $form['actions'] = [
    '#type' => 'actions',
    'submit' => [
      '#type' => 'submit',
      '#value' => t('Submit'),
      '#name' => 'submit',
    ],
  ];

  return $form;
}

function d7es_ckeditor5_configuration_form_submit($form, $form_state) {
  foreach ($form_state['values']['profiles'] as $id => $conf) {
    $profile = new Profile($id);
    $serialized = json_decode($conf['settings'], JSON_OBJECT_AS_ARRAY);
    $profile->setConfiguration($serialized);
    $profile->save();

    if (!empty($conf['formats'])) {
      foreach ($conf['formats'] as $format => $value) {
        if ($value) {
          db_merge('d7es_ckeditor5_input_format')
            ->key(['id' => $profile->getId()])
            ->fields(['format' => $format])
            ->execute();
        }
      }
    }
  }
}


