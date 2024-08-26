import { emDash, ellipsis } from 'prosemirror-inputrules'
import {
  InlineAnnotationsService,
  ImageService,
  LinkService,
  // ListsService,
  BaseService,
  DisplayBlockLevelService,
  TextBlockLevelService,
  NoteService,
  TrackChangeService,
  // CommentsService,
  MathService,
  FindAndReplaceService,
  FullScreenService,
  SpecialCharactersService,
  BottomInfoService,
  EditingSuggestingService,
} from 'wax-prosemirror-services'
import { TablesService, tableEditing, columnResizing } from 'wax-table-service'
import CommentsService from '../extensions/CommentsService/CommentsService'
import ListsService from '../CustomWaxToolGroups/ListsService/ListsService'
// import TrackChangeService from '../CustomWaxToolGroups/TrackChangeService/TrackChangeService'
import {
  KotahiBlockDropDownToolGroupService,
  JatsSideMenuToolGroupService,
  JatsAnnotationListTooolGroupService,
} from '../CustomWaxToolGroups'
import JatsTagsService from '../JatsTags'
import CharactersList from './CharactersList'
import KotahiSchema from './KotahiSchema'
import CitationService from '../CustomWaxToolGroups/CitationService/CitationService'
import 'wax-table-service/dist/index.css'

const updateTitle = title => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

const productionWaxEditorConfig = (
  handleAssetManager,
  updateAnystyle,
  updateCrossRef,
  styleReference,
  isReadOnly,
  getDataFromDatacite = false,
) => ({
  EnableTrackChangeService: {
    enabled: false,
    toggle: true,
    updateTrackStatus: () => true,
  },
  AcceptTrackChangeService: {
    own: {
      accept: !isReadOnly,
    },
    others: {
      accept: !isReadOnly,
    },
  },
  RejectTrackChangeService: {
    own: {
      reject: !isReadOnly,
    },
    others: {
      reject: !isReadOnly,
    },
  },
  SchemaService: KotahiSchema,
  // If we are in read-only mode, readOnly is set to true. This makes it so that the user cannot add more comments.
  // A little vexingly, however, the interface for adding (or replying to) comments is shown. Maybe this should be
  // changed in CommentsService in the future.
  CommentsService: { showTitle: true, readOnly: isReadOnly || false },
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
        'TrackingAndEditing',
        'FullScreen',
      ],
    },
    {
      templateArea: 'leftSideBar',
      toolGroups: ['JatsSideMenu'],
    },
    {
      templateArea: 'commentTrackToolBar',
      toolGroups: ['TrackCommentOptions'],
    },
    {
      templateArea: 'bottomRightInfo',
      toolGroups: [{ name: 'InfoToolGroup', exclude: ['ShortCutsInfo'] }],
    },
  ],

  PmPlugins: [columnResizing(), tableEditing()],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},
  SpecialCharactersService: CharactersList,

  TitleService: { updateTitle },
  ImageService: handleAssetManager ? { handleAssetManager } : {},
  CitationService: {
    AnyStyleTransformation: updateAnystyle,
    CrossRefTransformation: updateCrossRef,
    CiteProcTransformation: styleReference,
    readOnly: false,
    getDataFromDatacite,
  },
  services: [
    new BaseService(),
    new ImageService(),
    new InlineAnnotationsService(),
    new ListsService(),
    new TextBlockLevelService(),
    new DisplayBlockLevelService(),
    new NoteService(),
    new CommentsService(),
    new LinkService(),
    new TrackChangeService(),
    new MathService(),
    new FindAndReplaceService(),
    new FullScreenService(),
    new SpecialCharactersService(),
    new BottomInfoService(),
    new EditingSuggestingService(),
    // new TrackOptionsService(),
    new TablesService(),
    new JatsTagsService(),
    new JatsSideMenuToolGroupService(),
    new JatsAnnotationListTooolGroupService(),
    new CitationService(),
    new KotahiBlockDropDownToolGroupService(),
  ],
})

export default productionWaxEditorConfig
