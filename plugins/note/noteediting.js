// note/noteediting.js

// ADDED 2 imports.
import { Plugin, Widget, toWidget, toWidgetEditable } from 'ckeditor5';
import InsertNoteCommand from './insertnotecommand.js';


export default class NoteEditing extends Plugin {
  static get requires() {
    return [ Widget ];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add( 'insertnote', new InsertNoteCommand( this.editor ) );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register( 'note', {
      inheritAllFrom: '$blockObject'
    } );

    schema.register( 'noteTitle', {
      isLimit: true,
      allowIn: 'note',
      allowContentOf: '$block'
    } );

    schema.register( 'noteDescription', {
      isLimit: true,
      allowIn: 'note',
      allowContentOf: '$root'
    } );
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for( 'upcast' ).elementToElement( {
      model: 'note',
      view: {
        name: 'section',
        classes: 'note'
      }
    } );
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'note',
      view: {
        name: 'section',
        classes: 'note'
      }
    } );
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'note',
      view: ( modelElement, { writer: viewWriter } ) => {
        const section = viewWriter.createContainerElement( 'section', { class: 'note' } );

        return toWidget( section, viewWriter, { label: 'note widget' } );
      }
    } );

    conversion.for( 'upcast' ).elementToElement( {
      model: 'noteTitle',
      view: {
        name: 'h1',
        classes: 'note-title'
      }
    } );
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'noteTitle',
      view: {
        name: 'h1',
        classes: 'note-title'
      }
    } );
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'noteTitle',
      view: ( modelElement, { writer: viewWriter } ) => {
        const h1 = viewWriter.createContainerElement( 'h1', { class: 'note-title' } );
        return toWidget( h1, viewWriter );
      }
    } );

    conversion.for( 'upcast' ).elementToElement( {
      model: 'noteDescription',
      view: {
        name: 'div',
        classes: 'note-description'
      }
    } );
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'noteDescription',
      view: {
        name: 'div',
        classes: 'note-description'
      }
    } );
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'noteDescription',
      view: ( modelElement, { writer: viewWriter } ) => {
        const div = viewWriter.createEditableElement( 'div', { class: 'note-description' } );
        return toWidgetEditable( div, viewWriter );
      }
    } );
  }
}
