<?php

namespace Drupal\d7es_ckeditor5;

use Drupal\d7es_ckeditor5\ProfileInterface;

class Profile implements ProfileInterface {

  /**
   * @var
   */
  protected $id;

  /**
   * @var
   */
  protected $name;

  /**
   * @var array|mixed
   */
  protected $buttons;

  /**
   * @var array|mixed
   */
  protected $plugins;

  protected $formats;

  /**
   * @param $name
   */
  public function __construct($id) {
    $this->id = $id;

    try {
      $configuration = $this->load();
      $this->name = $configuration['name'];
      $this->buttons = $configuration['buttons'];
      $this->plugins = $configuration['plugins'];
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
  protected function load(): array {
    $conf = db_select('d7es_ckeditor5_settings', 'dcs')
      ->fields('dcs', [])
      ->condition('id', $this->id)
      ->execute()
      ->fetchAssoc();

    if (!empty($conf)) {
      $settings = unserialize($conf['settings']);
      return [
        'name' => $conf['name'] ?? NULL,
        'buttons' => $settings['buttons'] ?? [],
        'plugins' => $settings['plugins'] ?? [],
      ];
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
    return [
      'plugins' => $this->plugins,
      'buttons' => $this->buttons,
    ];
  }

  public function setConfiguration(array $configuration) {
    $this->name = $configuration['name'] ?? $this->name ?? NULL;
    $this->buttons = $configuration['buttons'] ?? $this->buttons ?? [];
    $this->plugins = $configuration['plugins'] ?? $this->plugins ?? [];
  }

  public function save() {
    try {
      $conf = $this->getConfiguration();

      db_merge('d7es_ckeditor5_settings')
        ->key(array('id' => $this->id))
        ->fields(array(
          'name' => $this->getName(),
          'settings' => serialize($conf),
        ))
        ->execute();
    }
    catch (\Exception $e) {}
  }

  public function getId(): string {
    return $this->id;
  }

  public function getName(): string {
    return $this->name;
  }
}
