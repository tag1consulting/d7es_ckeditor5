import { Command } from 'ckeditor5';

const createNote = ( writer ) => {
  const note = writer.createElement( 'note' );
  const noteTitle = writer.createElement( 'noteTitle' );
  writer.insertText('Lorem Ipsum', noteTitle);
  const noteDescription = writer.createElement( 'noteDescription' );

  writer.append( noteTitle, note );
  writer.append( noteDescription, note );

  writer.appendElement( 'paragraph', noteDescription );

  return note;
};

export default class InsertNoteCommand extends Command {
  execute() {
    this.editor.model.change( writer => {
      this.editor.model.insertObject( createNote( writer ) );
    } );
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'note' );
    this.isEnabled = allowedIn !== null;
  }
}
