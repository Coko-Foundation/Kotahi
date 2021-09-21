import { DefaultSchema } from 'wax-prosemirror-utilities'
import { emDash, ellipsis } from 'prosemirror-inputrules'
import { columnResizing, tableEditing } from 'prosemirror-tables'
import {
  AnnotationToolGroupService,
  BaseService,
  BaseToolGroupService,
  BottomInfoService,
  DisplayToolGroupService,
  EditorInfoToolGroupServices,
  FindAndReplaceService,
  FullScreenService,
  FullScreenToolGroupService,
  ImageService,
  ImageToolGroupService,
  InlineAnnotationsService,
  LinkService,
  ListsService,
  ListToolGroupService,
  MathService,
  NoteService,
  NoteToolGroupService,
  SpecialCharactersService,
  SpecialCharactersToolGroupService,
  TablesService,
  TableToolGroupService,
  TextBlockLevelService,
  TextToolGroupService,
  DisplayBlockLevelService,
} from 'wax-prosemirror-services'
import { KotahiBlockDropDownToolGroupService } from '../CustomWaxToolGroups'
import ExtendedHeadingService from '../ExtendedHeaders'

const updateTitle = title => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

const fullWaxEditorConfig = () => ({
  EnableTrackChangeService: false, // This line is needed by NoteService
  SchemaService: DefaultSchema,
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        {
          name: 'Base',
          exclude: ['Save'],
        },
        'KotahiBlockDropDown',
        {
          name: 'Annotations',
          more: [
            'Superscript',
            'Subscript',
            'SmallCaps',
            'Underline',
            'StrikeThrough',
            'Code',
          ],
        },
        'SpecialCharacters',
        'Lists',
        'Notes',
        'Tables',
        'Images',
        'FullScreen',
      ],
    },
    {
      templateArea: 'BottomRightInfo',
      toolGroups: [{ name: 'InfoToolGroup', exclude: ['ShortCutsInfo'] }],
    },
  ],

  PmPlugins: [columnResizing(), tableEditing()],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  TitleService: { updateTitle },

  services: [
    new AnnotationToolGroupService(),
    new BaseService(),
    new BaseToolGroupService(),
    new BottomInfoService(),
    new DisplayToolGroupService(),
    new EditorInfoToolGroupServices(),
    new FindAndReplaceService(), // Needed by NoteService
    new ImageService(),
    new ImageToolGroupService(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new ListToolGroupService(),
    new MathService(),
    new NoteService(),
    new NoteToolGroupService(),
    new SpecialCharactersService(),
    new SpecialCharactersToolGroupService(),
    new TablesService(),
    new TableToolGroupService(),
    new TextBlockLevelService(),
    new TextToolGroupService(),
    // these are added for paragraph dropdown:
    new ExtendedHeadingService(),
    new KotahiBlockDropDownToolGroupService(),
    new DisplayBlockLevelService(),
    // these are added for full screen
    new FullScreenService(),
    new FullScreenToolGroupService(),
  ],
})

export default fullWaxEditorConfig
