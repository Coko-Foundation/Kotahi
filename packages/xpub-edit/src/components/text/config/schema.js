import { Schema } from 'prosemirror-model'

import nodes from './nodes'

const marks = {}

export default new Schema({ marks, nodes })
