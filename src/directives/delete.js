import { directive } from '../compiler/directives.js'
import { registerMutationDirective } from './mutation.js'

registerMutationDirective(
    directive,
    'delete',
    'DELETE'
)