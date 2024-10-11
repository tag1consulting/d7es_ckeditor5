<?php

/**
 * Implements hook_drush_command().
 */
function d7es_ckeditor5_drush_command() {
  $commands['d7es-ckeditor5-config-migrate'] = [
    'description' => dt('Migrate existent CKEditor 4 configuration files.'),
    'aliases' => ['d7ccm'],
    'arguments' => [],
    'options' => [],
  ];

  return $commands;
}


function drush_d7es_ckeditor5_config_migrate() {
  module_load_include('inc', 'd7es_ckeditor5', 'd7es_ckeditor5.migrate');
  d7es_ckeditor5_configuration_migrate();
}
