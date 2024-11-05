<?php

namespace Drupal\d7es_ckeditor5;

use Drupal\d7es_ckeditor5\ProfileInterface;

class Profile implements ProfileInterface {

  /**
   * @var
   */
  protected $id;

  /**
   * @var array|mixed
   */
  protected $configuration;

  protected $formats;

  /**
   * @param $name
   */
  public function __construct($id) {
    $this->id = $id;

    try {
      $this->configuration = $this->loadConfiguration();
      $this->formats = $this->getFormats();
    }
    catch (\Exception $e) {
      watchdog_exception('d7es_ckeditor5', $e);
    }
  }

  /**
   * @return array
   * @throws \Exception
   */
  protected function loadConfiguration(): array {
    $conf = db_select('d7es_ckeditor5_settings', 'dcs')
      ->fields('dcs', [])
      ->condition('id', $this->id)
      ->execute()
      ->fetchAssoc();

    if (!empty($conf)) {
      return unserialize($conf['settings']);
    }

    return [];
  }

  public function getFormats() {
    return db_select('d7es_ckeditor5_input_format', 'dcif')
      ->fields('dcif', ['id', 'format'])
      ->condition('id', $this->id)
      ->execute()
      ->fetchAllKeyed();
  }

  public function getConfiguration(): array {
    return $this->configuration;
  }

  public function setConfiguration(array $configuration): void {
    $this->configuration = $configuration;
  }

  public function save(): void {
    try {
      $configuration = $this->getConfiguration();

      db_merge('d7es_ckeditor5_settings')
        ->key(array('id' => $this->id))
        ->fields(array(
          'settings' => serialize($configuration),
        ))
        ->execute();
    }
    catch (\Exception $e) {}
  }

  public function getId(): string {
    return $this->id;
  }
}
