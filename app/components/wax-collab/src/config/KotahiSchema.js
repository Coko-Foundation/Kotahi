import { DefaultSchema } from 'wax-prosemirror-utilities'

// Note that toDOM for a lot of the Wax marks looks like this:

// toDOM(hook, next) {
// 	hook.value = ['span', hook.node.attrs, 0];
// 	next();
// },
//
// ( https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-schema/src/marks/smallcapsMark.js )
//
// though in prosemirror this tends to look like this:
//
// toDOM() {
// 	return ['span', { class: 'mixed-citation' }, 0]
// },

// FIGURE OUT:
//
// - how can we exclude more than one thing? just an array?

const KotahiSchema = {
  ...DefaultSchema,
  marks: {
    mixedCitationSpan: {
      attrs: {
        class: { default: 'mixed-citation' },
      },
      excludes: 'mixedCitationSpan', // so we can't embed it inside itself
      parseDOM: [{ tag: 'span.mixed-citation' }],
      toDOM() {
        // TODO: This should send this to Crossref to get back content!
        return ['span', { class: 'mixed-citation' }, 0]
      },
    },
    articleTitle: {
      attrs: {
        class: { default: 'article-title' },
      },
      excludes: 'articleTitle', // so we can't embed it inside itself
      parseDOM: [{ tag: 'span.article-title' }],
      toDOM() {
        return ['span', { class: 'article-title' }, 0]
      },
    },
    authorName: {
      attrs: {
        class: { default: 'author-name' },
      },
      excludes: 'authorName', // so we can't embed it inside itself
      parseDOM: [{ tag: 'span.author-name' }],
      toDOM() {
        return ['span', { class: 'author-name' }, 0]
      },
    },
    doi: {
      // QUESTION: this should set the content as the href. Does it do that?
      attrs: {
        href: { default: null },
        rel: { default: '' },
        target: { default: 'blank' },
        title: { default: null },
        class: { default: 'doi' },
      },
      excludes: 'doi', // so we can't embed it inside itself
      inclusive: false, // see: https://prosemirror.net/examples/schema/
      parseDOM: [
        // but see https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-schema/src/marks/linkMark.js
        {
          tag: 'a.doi',
          getAttrs(dom) {
            return { href: dom.href }
          },
        },
      ],
      toDOM() {
        return ['a', { class: 'doi' }, 0]
      },
      // // this causes an error – why?
      // toDOM(hook, next) {
      //   // eslint-disable-next-line no-param-reassign
      //   hook.value = ['a', hook?.node?.attrs, 0]
      //   next()
      // },
    },
  },
}

// console.log(KotahiSchema)

export default KotahiSchema
