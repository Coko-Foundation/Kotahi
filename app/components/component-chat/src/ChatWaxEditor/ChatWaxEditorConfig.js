import { emDash, ellipsis } from 'prosemirror-inputrules'
import { DefaultSchema } from 'wax-prosemirror-utilities'
import {
  AnnotationToolGroupService,
  BottomInfoService,
  DisplayToolGroupService,
  EditorInfoToolGroupServices,
  InlineAnnotationsService,
  LinkService,
  ListsService,
  ListToolGroupService,
  MathService,
  NoteToolGroupService,
  SpecialCharactersService,
  SpecialCharactersToolGroupService,
  TextBlockLevelService,
  TextToolGroupService,
  DisplayBlockLevelService,
} from 'wax-prosemirror-services'
import { KotahiBlockDropDownToolGroupService } from '../../../wax-collab/src/CustomWaxToolGroups'
import CharactersList from '../../../wax-collab/src/config/CharactersList'

const updateTitle = title => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

const chatWaxEditorConfig = () => ({
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
  ],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  SpecialCharactersService: CharactersList,

  TitleService: { updateTitle },

  services: [
    new AnnotationToolGroupService(),
    new BottomInfoService(),
    new DisplayToolGroupService(),
    new EditorInfoToolGroupServices(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new ListToolGroupService(),
    new MathService(),
    new NoteToolGroupService(),
    new SpecialCharactersService(),
    new SpecialCharactersToolGroupService(),
    new TextBlockLevelService(),
    new TextToolGroupService(),
    new KotahiBlockDropDownToolGroupService(),
    new DisplayBlockLevelService(),
  ],
})

export default chatWaxEditorConfig
