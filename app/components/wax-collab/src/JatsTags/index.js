import { Service } from 'wax-prosemirror-services'
import Appendix from './Appendix'
import AppendixHeader from './AppendixHeader'
import FrontMatter from './FrontMatter'
import Abstract from './Abstract'
import AcknowledgementsSection from './AcknowledgementSection'
import RefList from './citations/RefList'
import ReferenceHeader from './citations/ReferenceHeader'
import Reference from './citations/Reference'
import ArticleTitle from './citations/ArticleTitle'
import JournalTitle from './citations/JournalTitle'
import MixedCitationSpan from './citations/MixedCitationSpan'
import AuthorName from './citations/AuthorName'
import AuthorGroup from './citations/AuthorGroup'
import Volume from './citations/Volume'
import Issue from './citations/Issue'
import Doi from './citations/Doi'
import Year from './citations/Year'
import FirstPage from './citations/FirstPage'
import LastPage from './citations/LastPage'
import AwardId from './funding/AwardId'
import FundingSource from './funding/FundingSource'
import FundingStatement from './funding/FundingStatement'
import KeywordList from './keywords/KeywordList'
import Keyword from './keywords/Keyword'
import GlossarySection from './glossary/GlossarySection'
import GlossaryTerm from './glossary/GlossaryTerm'
import GlossaryItem from './glossary/GlossaryItem'

// copied from here: https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-services/src/DisplayBlockLevel/HeadingService/HeadingService.js

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

class JatsTagsService extends Service {
  // boot() {}

  register() {
    this.container.bind('Reference').to(Reference)
    this.container.bind('Appendix').to(Appendix)
    this.container.bind('AppendixHeader').to(AppendixHeader)
    this.container.bind('RefList').to(RefList)
    this.container.bind('ReferenceHeader').to(ReferenceHeader)
    this.container.bind('FrontMatter').to(FrontMatter)
    this.container.bind('Abstract').to(Abstract)
    this.container.bind('AwardId').to(AwardId)
    this.container.bind('FundingStatement').to(FundingStatement)
    this.container.bind('FundingSource').to(FundingSource)
    this.container.bind('AcknowledgementsSection').to(AcknowledgementsSection)
    this.container.bind('ArticleTitle').to(ArticleTitle)
    this.container.bind('JournalTitle').to(JournalTitle)
    this.container.bind('MixedCitationSpan').to(MixedCitationSpan)
    this.container.bind('AuthorName').to(AuthorName)
    this.container.bind('AuthorGroup').to(AuthorGroup)
    this.container.bind('Doi').to(Doi)
    this.container.bind('Volume').to(Volume)
    this.container.bind('Issue').to(Issue)
    this.container.bind('Year').to(Year)
    this.container.bind('FirstPage').to(FirstPage)
    this.container.bind('LastPage').to(LastPage)
    this.container.bind('KeywordList').to(KeywordList)
    this.container.bind('Keyword').to(Keyword)
    this.container.bind('GlossarySection').to(GlossarySection)
    this.container.bind('GlossaryTerm').to(GlossaryTerm)
    this.container.bind('GlossaryItem').to(GlossaryItem)
    const createNode = this.container.get('CreateNode')
    const createMark = this.container.get('CreateMark')
    createNode({
      reference: {
        content: 'inline*',
        group: 'block',
        defining: true,
        attrs: {
          class: { default: 'reference' },
        },
        parseDOM: [
          {
            tag: 'p.reference',
            getAttrs(hook, next) {
              Object.assign(hook, {
                // this conked out in FullWaxEditor so I adjusted
                class: hook?.dom?.getAttribute('class') || 'reference',
              })
              // this conked out in FullWaxEditor so I adjusted
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'reference' }
          return ['p', attrs, 0]
        },
      },
    })
    createNode({
      refList: {
        content: 'block+',
        // content: 'referenceHeader? reference*', // this was more specific
        group: 'block',
        defining: true,
        attrs: {
          class: { default: 'reflist' },
        },
        parseDOM: [
          {
            tag: 'section.reflist',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'reflist',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'reflist' }
          return ['section', attrs, 0]
        },
      },
    })
    createNode({
      referenceHeader: {
        content: 'inline*',
        group: 'block',
        priority: 0,
        defining: true,
        attrs: {
          class: { default: 'referenceheader' },
        },
        parseDOM: [
          {
            tag: 'h1.referenceheader',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'referenceheader',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'referenceheader' }
          return ['h1', attrs, 0]
        },
      },
    })
    createNode({
      appendix: {
        content: 'block+',
        group: 'block',
        defining: true,
        attrs: {
          class: { default: 'appendix' },
        },
        parseDOM: [
          {
            tag: 'section.appendix',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'appendix',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'appendix' }
          return ['section', attrs, 0]
        },
      },
    })
    createNode({
      appendixHeader: {
        content: 'inline*',
        group: 'block',
        priority: 0,
        defining: true,
        attrs: {
          class: { default: 'appendixheader' },
        },
        parseDOM: [
          {
            tag: 'h1.appendixheader',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'appendixheader',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'appendixheader' }
          return ['h1', attrs, 0]
        },
      },
    })
    createNode({
      frontMatter: {
        content: 'block+',
        group: 'block',
        defining: true,
        attrs: {
          class: { default: 'frontmatter' },
        },
        parseDOM: [
          {
            tag: 'section.frontmatter',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'frontmatter',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'frontmatter' }
          return ['section', attrs, 0]
        },
      },
    })

    createNode({
      awardId: {
        content: 'inline*',
        group: 'block',
        priority: 0,
        defining: true,
        attrs: {
          class: { default: 'awardid' },
        },
        parseDOM: [
          {
            tag: 'p.awardid',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'awardid',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'awardid',
            title: 'Award ID',
          }

          return ['p', attrs, 0]
        },
      },
    })

    createNode({
      fundingSource: {
        content: 'inline*',
        group: 'block',
        priority: 0,
        defining: true,
        attrs: {
          class: { default: 'fundingsource' },
        },
        parseDOM: [
          {
            tag: 'p.fundingsource',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'fundingsource',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'fundingsource',
            title: 'Funding Source',
          }

          return ['p', attrs, 0]
        },
      },
    })

    createNode({
      fundingStatement: {
        content: 'inline*',
        group: 'block',
        priority: 0,
        defining: true,
        attrs: {
          class: { default: 'fundingstatement' },
        },
        parseDOM: [
          {
            tag: 'p.fundingstatement',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'fundingstatement',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'fundingstatement',
            title: 'Funding Statement',
          }

          return ['p', attrs, 0]
        },
      },
    })

    createNode({
      abstractSection: {
        content: 'block+',
        group: 'block',
        defining: true,
        attrs: {
          class: { default: 'abstractSection' },
        },
        parseDOM: [
          {
            tag: 'section.abstractSection',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'abstractSection',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'abstractSection' }
          return ['section', attrs, 0]
        },
      },
    })
    createNode({
      acknowledgementsSection: {
        content: 'block+',
        group: 'block',
        defining: true,
        attrs: {
          class: { default: 'acknowledgementsSection' },
        },
        parseDOM: [
          {
            tag: 'section.acknowledgementsSection',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class:
                  hook?.dom?.getAttribute('class') || 'acknowledgementsSection',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'acknowledgementsSection',
          }

          return ['section', attrs, 0]
        },
      },
    })
    createNode({
      keywordList: {
        content: 'inline*',
        group: 'block',
        priority: 0,
        defining: true,
        attrs: {
          class: { default: 'keyword-list' },
        },
        parseDOM: [
          {
            tag: 'p.keyword-list',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'keyword-list',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'keyword-list',
            title: 'Keyword list',
          }

          return ['p', attrs, 0]
        },
      },
    })
    createNode({
      glossarySection: {
        content: 'block+',
        group: 'block',
        defining: true,
        attrs: {
          class: { default: 'glossary' },
        },
        parseDOM: [
          {
            tag: 'section.glossary',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'glossary',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'glossary' }
          return ['section', attrs, 0]
        },
      },
    })
    createNode({
      glossaryItem: {
        content: 'inline*',
        group: 'block',
        priority: 0,
        defining: true,
        attrs: {
          class: { default: 'glossary-item' },
        },
        parseDOM: [
          {
            tag: 'p.glossary-item',
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'glossary-item',
              })
              typeof next !== 'undefined' && next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'glossary-item',
            title: 'Glossary item',
          }

          return ['p', attrs, 0]
        },
      },
    })
    // marks
    createMark({
      mixedCitationSpan: {
        attrs: {
          class: { default: 'mixed-citation' },
        },
        excludes: 'mixedCitationSpan', // so we can't embed it inside itself
        parseDOM: [{ tag: 'span.mixed-citation' }],
        toDOM() {
          // TODO: This should send this to Crossref to get back content!
          return [
            'span',
            { class: 'mixed-citation', title: 'Mixed Citation' },
            0,
          ]
        },
      },
    })
    createMark({
      articleTitle: {
        attrs: {
          class: { default: 'article-title' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.article-title' }],
        toDOM() {
          return ['span', { class: 'article-title', title: 'Article Title' }, 0]
        },
      },
    })
    createMark({
      journalTitle: {
        attrs: {
          class: { default: 'journal-title' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.journal-title' }],
        toDOM() {
          return ['span', { class: 'journal-title', title: 'Journal Title' }, 0]
        },
      },
    })
    createMark({
      authorGroup: {
        attrs: {
          class: { default: 'author-group' },
        },
        group: 'citationMarks',
        excludes: 'authorGroup', // so we can't embed it inside itself
        parseDOM: [{ tag: 'span.author-group' }],
        toDOM() {
          return ['span', { class: 'author-group', title: 'Author Group' }, 0]
        },
      },
    })
    createMark({
      authorName: {
        attrs: {
          class: { default: 'author-name' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.author-name' }],
        toDOM() {
          return ['span', { class: 'author-name', title: 'Author Name' }, 0]
        },
      },
    })
    createMark({
      volume: {
        attrs: {
          class: { default: 'volume' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.volume' }],
        toDOM() {
          return ['span', { class: 'volume', title: 'Volume' }, 0]
        },
      },
    })
    createMark({
      issue: {
        attrs: {
          class: { default: 'issue' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.issue' }],
        toDOM() {
          return ['span', { class: 'issue', title: 'Issue' }, 0]
        },
      },
    })
    createMark({
      year: {
        attrs: {
          class: { default: 'year' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.year' }],
        toDOM() {
          return ['span', { class: 'year', title: 'Year' }, 0]
        },
      },
    })
    createMark({
      firstPage: {
        attrs: {
          class: { default: 'first-page' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.first-page' }],
        toDOM() {
          return ['span', { class: 'first-page', title: 'First Page' }, 0]
        },
      },
    })
    createMark({
      lastPage: {
        attrs: {
          class: { default: 'last-page' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.last-page' }],
        toDOM() {
          return ['span', { class: 'last-page', title: 'Last Page' }, 0]
        },
      },
    })
    createMark({
      doi: {
        // QUESTION: this should set the content as the href. Does it do that?
        attrs: {
          href: { default: null },
          rel: { default: '' },
          target: { default: 'blank' },
          title: { default: null },
          class: { default: 'doi' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
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
          // TODO: figure out how to get the href to go to the content?
          return ['a', { class: 'doi', href: 'hello!', title: 'DOI' }, 0]
        },
        // // this causes an error – why?
        // toDOM(hook, next) {
        //   // eslint-disable-next-line no-param-reassign
        //   hook.value = ['a', hook?.node?.attrs, 0]
        //   next()
        // },
      },
    })
    createMark({
      keyword: {
        attrs: {
          class: { default: 'keyword' },
        },
        excludes: 'keyword',
        parseDOM: [{ tag: 'span.keyword' }],
        toDOM() {
          return ['span', { class: 'keyword', title: 'Keyword' }, 0]
        },
      },
    })
    createMark({
      glossaryTerm: {
        attrs: {
          class: { default: 'glossary-term' },
        },
        excludes: 'glossaryTerm',
        parseDOM: [{ tag: 'span.glossary-term' }],
        toDOM() {
          return ['span', { class: 'glossary-term', title: 'Glossary term' }, 0]
        },
      },
    })
  }
}

export default JatsTagsService
