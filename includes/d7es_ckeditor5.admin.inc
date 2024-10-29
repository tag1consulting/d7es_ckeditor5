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
      $configuration = $profile->getConfiguration();
      $formats = filter_formats();
      $profile_formats = $profile->getFormats();

      $form['profiles'][$profile->getID()]['settings'] = [
        '#type' => 'textarea',
        '#default_value' => drupal_json_encode($profile->getConfiguration()),
        '#title' => $profile->getID(),
        '#access' => FALSE,
      ];

      $plugins = d7es_ckeditor5_plugins();
      if (!empty($plugins)) {
        $form['profiles'][$profile->getID()] = [
          '#type' => 'fieldset',
          '#title' => $profile->getID(),
          '#collapsed' => TRUE,
          '#collapsible' => TRUE,
        ];

        $form['profiles'][$profile->getID()]['buttons'] = [
          '#type' => 'container',
          '#tree' => TRUE,
        ];

        foreach ($plugins as $key => $definition) {
          [$module, $plugin] = explode('.', $key);
          if (!empty($definition['buttons'])) {
            foreach ($definition['buttons'] as $id => $button) {
              $form['profiles'][$profile->getID()]['buttons'][$id] = [
                '#type' => 'checkbox',
                '#title' => $button['label'],
                '#return_value' => "$key.$id",
                '#default_value' => !empty($configuration[$module][$plugin][$id]),
              ];
            }
          }
        }

        $form['profiles'][$profile->getID()]['formats'] = [
          '#type' => 'fieldset',
          '#title' => t('Available formats'),
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

/**
 * Configuration form submit handler.
 *
 * @param $form
 *   The form.
 * @param $form_state
 *   The form state.
 *
 * @return void
 * @throws \InvalidMergeQueryException
 */
function d7es_ckeditor5_configuration_form_submit($form, $form_state) {
  foreach ($form_state['values']['profiles'] as $id => $conf) {
    $settings = [];
    if (!empty($conf['buttons'])) {
      foreach ($conf['buttons'] as $value) {
        if ($value) {
          [$module, $plugin, $button] = explode('.', $value);
          $settings[$module][$plugin][$button] = TRUE;
        }
      }
    }

    $profile = new Profile($id);
    $profile->setConfiguration($settings);
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


