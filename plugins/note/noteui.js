import { ButtonView, Plugin } from 'ckeditor5';

export default class NoteUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;

    editor.ui.componentFactory.add( 'note', locale => {
      // The state of the button will be bound to the widget command.
      const command = editor.commands.get( 'insertnote' );

      // The button will be an instance of ButtonView.
      const buttonView = new ButtonView( locale );

      buttonView.set( {
        label: t( 'Note' ),
        withText: true,
        tooltip: true
      } );

      buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
      this.listenTo( buttonView, 'execute', () => editor.execute( 'insertnote' ) );
      return buttonView;
    } );
  }
}
