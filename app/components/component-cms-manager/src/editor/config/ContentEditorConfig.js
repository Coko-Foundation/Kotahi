import { emDash, ellipsis } from 'prosemirror-inputrules'
import {
  InlineAnnotationsService,
  AnnotationToolGroupService,
  ImageService,
  ImageToolGroupService,
  LinkService,
  ListsService,
  ListToolGroupService,
  BaseService,
  BaseToolGroupService,
  DisplayBlockLevelService,
  DisplayToolGroupService,
  TextBlockLevelService,
  TextToolGroupService,
  MathService,
  FindAndReplaceService,
  FullScreenService,
  FullScreenToolGroupService,
  SpecialCharactersService,
  SpecialCharactersToolGroupService,
} from 'wax-prosemirror-services'
import {
  TablesService,
  /* tableEditing, */ columnResizing,
} from 'wax-table-service'
import { KotahiBlockDropDownToolGroupService } from '../../../../wax-collab/src/CustomWaxToolGroups'
import CharactersList from '../../../../wax-collab/src/config/CharactersList'
import KotahiSchema from '../../../../wax-collab/src/config/KotahiSchema'
import 'wax-table-service/dist/index.css'

const fullWaxEditorConfig = handleAssetManager => ({
  SchemaService: KotahiSchema,
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
        'Tables',
        'Images',
        // 'find',
        // 'TrackingAndEditing',
        'FullScreen',
      ],
    },
  ],

  PmPlugins: [columnResizing() /* tableEditing() */],

  RulesService: [emDash, ellipsis],

  SpecialCharactersService: CharactersList,

  ImageService: handleAssetManager ? { handleAssetManager } : {},

  // end insertion

  services: [
    new AnnotationToolGroupService(),
    new BaseService(),
    new BaseToolGroupService(),
    new DisplayToolGroupService(),
    new FindAndReplaceService(),
    new ImageService(),
    new ImageToolGroupService(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new ListToolGroupService(),
    new MathService(),
    new SpecialCharactersService(),
    new SpecialCharactersToolGroupService(),
    new TablesService(),
    new TextBlockLevelService(),
    new TextToolGroupService(),
    // these are added for paragraph dropdown:
    new KotahiBlockDropDownToolGroupService(),
    new DisplayBlockLevelService(),
    // these are added for full screen
    new FullScreenService(),
    new FullScreenToolGroupService(),
  ],
})

export default fullWaxEditorConfig
