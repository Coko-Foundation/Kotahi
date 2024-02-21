import { emDash, ellipsis } from 'prosemirror-inputrules'
import { DefaultSchema } from 'wax-prosemirror-core'
import {
  // AnnotationToolGroupService,
  BottomInfoService,
  // DisplayToolGroupService,
  // EditorInfoToolGroupServices,
  InlineAnnotationsService,
  LinkService,
  // ListsService,
  // ListToolGroupService,
  MathService,
  NoteService,
  // NoteToolGroupService,
  SpecialCharactersService,
  // SpecialCharactersToolGroupService,
  TextBlockLevelService,
  // TextToolGroupService,
  DisplayBlockLevelService,
} from 'wax-prosemirror-services'
import ListsService from '../CustomWaxToolGroups/ListsService/ListsService'
import { KotahiBlockDropDownToolGroupService } from '../CustomWaxToolGroups'
import CharactersList from './CharactersList'

const updateTitle = title => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

const simpleWaxEditorConfig = () => ({
  SchemaService: DefaultSchema,
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        'KotahiBlockDropDown',
        {
          name: 'Annotations',
          exclude: ['StrikeThrough', 'Code'],
        },
        'SpecialCharacters',
        'Lists',
      ],
    },
    {
      templateArea: 'bottomRightInfo',
      toolGroups: [{ name: 'InfoToolGroup', exclude: ['ShortCutsInfo'] }],
    },
  ],

  SpecialCharactersService: CharactersList,

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  TitleService: { updateTitle },

  services: [
    // new AnnotationToolGroupService(),
    new BottomInfoService(),
    // new DisplayToolGroupService(),
    // new EditorInfoToolGroupServices(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    // new ListToolGroupService(),
    new MathService(),
    new NoteService(),
    // new NoteToolGroupService(),
    new SpecialCharactersService(),
    // new SpecialCharactersToolGroupService(),
    new TextBlockLevelService(),
    // new TextToolGroupService(),
    // this is what I've added::
    new KotahiBlockDropDownToolGroupService(),
    new DisplayBlockLevelService(),
  ],
})

export default simpleWaxEditorConfig
