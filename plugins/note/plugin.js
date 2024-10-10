import {Plugin} from 'ckeditor5';
import NoteEditing from './noteediting.js';
import NoteUI from './noteui.js';

export class Note extends Plugin {
  static get requires() {
    return [ NoteEditing, NoteUI ];
  }
}
