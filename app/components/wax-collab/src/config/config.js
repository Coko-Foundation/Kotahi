// import * as Y from 'yjs'
// import { WebsocketProvider } from 'y-websocket'
// import {
//   ySyncPlugin,
//   yCursorPlugin,
//   yUndoPlugin,
//   undo,
//   redo,
// } from 'y-prosemirror'

// import * as sharedTypes from '../provider'
import { emDash, ellipsis } from 'prosemirror-inputrules'

import {
  AnnotationToolGroupService,
  ImageService,
  PlaceholderService,
  InlineAnnotationsService,
  LinkService,
  // ListsService,
  // ListToolGroupService,
  // TablesService,
  // TableToolGroupService,
  BaseService,
  BaseToolGroupService,
  DisplayBlockLevelService,
  DisplayToolGroupService,
  ImageToolGroupService,
  TextBlockLevelService,
  TextToolGroupService,
  // NoteService,
  // NoteToolGroupService,
  // TrackChangeService,
  // CommentsService,
} from 'wax-prosemirror-services'

// import _ from 'lodash'
import invisibles, {
  // space,
  hardBreak,
  // paragraph,
} from '@guardian/prosemirror-invisibles'

// const ydoc = new Y.Doc();
// const provider = new WebsocketProvider(
//   "ws://localhost:1234",
//   "waxingandwaning",
//   ydoc
// );

// const colors = [{ light: '#6eeb8333', dark: '#6eeb83' },
// { light: '#ecd44433', dark: '#ecd444' }]
// const type = ydoc.getXmlFragment("prosemirror");

// const opts = [sharedTypes.prosemirrorEditorContent, { permanentUserData: sharedTypes.permanentUserData, colors }]
// const opts = [sharedTypes.prosemirrorEditorContent]
// sharedTypes.awareness.setLocalStateField('user', _.sample(users))

// console.log(ydoc, provider, type);

export default {
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        'Base',
        {
          name: 'Annotations',
          exclude: ['Subscript', 'Superscript', 'SmallCaps'],
        },
      ],
    },
  ],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  PmPlugins: [
    invisibles([hardBreak()]),
    // ySyncPlugin(...opts),
    // yCursorPlugin(sharedTypes.awareness),
    // yUndoPlugin(),
  ],

  services: [
    new PlaceholderService(),
    new ImageService(),
    // new ListsService(),
    new InlineAnnotationsService(),
    new LinkService(),
    // new TablesService(),
    new TextBlockLevelService(),
    new BaseService(),
    new BaseToolGroupService(),
    new DisplayBlockLevelService(),
    // new TableToolGroupService(),
    new DisplayToolGroupService(),
    new ImageToolGroupService(),
    new TextToolGroupService(),
    new AnnotationToolGroupService(),
    // new NoteToolGroupService(),
    // new ListToolGroupService(),
  ],
}
