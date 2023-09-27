/* eslint react/prop-types: 0 */
import React, { useEffect, useState, useContext } from 'react'
import { DOMParser, DOMSerializer, Fragment } from 'prosemirror-model'
import { WaxContext, DocumentHelpers } from 'wax-prosemirror-core'
import { sanitize } from 'isomorphic-dompurify'
import striptags from 'striptags'
import { List, AlertCircle, CheckCircle } from 'react-feather'
import { color } from '../../../../../../theme'
import { Spinner } from '../../../../../shared'
import Modal from '../../../../../component-modal/src/Modal'
import CitationVersion from './CitationVersion'
import EditModal from './EditModal'
import {
  Wrapper,
  CitationWrapper,
  StatusContainer,
  PopUpWrapper,
  Button,
  StatusBar,
  CitationOuterWrapper,
  CloseButton,
  CloseButtonIcon,
} from './styles'

// TODO LIST FOR THIS COMPONENT:
//
// Possible functionality going forward:
// 1) run recheck if we don't have Crossref versions when component is opened?
// 2) needs to interact with ReferenceList component

const decodeEntities = s => {
  let temp = document.createElement('p')
  temp.innerHTML = s
  const str = temp.textContent || temp.innerText
  temp = null
  return str
}

const serializer = schema => {
  const WaxSerializer = DOMSerializer.fromSchema(schema)

  return content => {
    const container = document.createElement('article')
    container.appendChild(WaxSerializer.serializeFragment(content))
    return container.innerHTML
  }
}

const decideStatus = (needsReview, needsValidation) => {
  // weirdly, we're not actually using "valid"
  const currentValidationStatus = needsValidation
    ? 'needs validation'
    : 'checked'

  return needsReview ? 'needs review' : currentValidationStatus
}

const CitationComponent = ({ node, getPos }) => {
  const { app, pmViews, activeView } = useContext(WaxContext)

  // eslint-disable-next-line
  const citationConfig = app.config._config.config.CitationService

  const {
    AnyStyleTransformation,
    CrossRefTransformation,
    CiteProcTransformation,
  } = citationConfig

  const {
    originalText,
    needsReview,
    needsValidation,
    structure,
    possibleStructures,
    valid,
    refId,
  } = node.attrs

  // console.log(originalText, needsReview, needsValidation, valid)

  const makeHtmlFrom = content => {
    const serialize = serializer(activeView.state.schema)
    return serialize(content)
  }

  const formattedOriginalText =
    originalText || `<p class="ref">${makeHtmlFrom(node.content)}</p>`

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  // Note: state is maintained on the attributes of the node.
  // But that doesn't trigger a re-render (or useEffects), so we need to maintain
  // a version of that; these variables do this.
  const [internalNeedsReview, setInternalNeedsReview] = useState(needsReview)

  const [internalNeedsValidation, setInternalNeedsValidation] = useState(
    needsValidation,
  )

  const [structures, setStructures] = useState({
    original: possibleStructures?.original || formattedOriginalText,
    anyStyle: possibleStructures?.anyStyle || '',
    crossRef: possibleStructures?.crossRef || [],
    custom: possibleStructures?.custom || '',
  })

  // These are what's shown in the component

  const [currentText, setCurrentText] = useState(
    `<p class="ref">${makeHtmlFrom(node.content)}</p>`,
  )

  // These are what's passed back
  const [potentialCsl, setPotentialCsl] = useState(structure || {})

  const [potentialText, setPotentialText] = useState(
    `<p class="ref">${makeHtmlFrom(node.content)}</p>`,
  )

  const getNodeWithId = id => {
    // This returns a "reference" node with the refID from activeView
    let nodeFound

    activeView.state.doc.nodesBetween(
      getPos(),
      getPos() + 1,
      (possibleNode, pos) => {
        if (
          possibleNode.type.name === 'reference' &&
          possibleNode.attrs.refId === id
        ) {
          nodeFound = possibleNode
        }
      },
    )

    return nodeFound
  }

  const setContent = (attrs, fragment, onlyAttrs) => {
    // console.log('Running setContent, fragemnt:', fragment, 'attrs:', attrs)
    // This function replaces the current node with a version with new attributes and new content
    // if onlyAttrs is true, we're only changing the attributes, not the content
    const thisNode = getNodeWithId(refId)

    // console.log('\n\nSetting content: ', fragment)
    if (thisNode) {
      let { tr } = activeView.state
      const startPosition = getPos()

      const endPosition = startPosition + thisNode.content.size + 1

      const newNode = activeView.state.schema.nodes.reference.create({
        class: 'ref',
        refId,
        originalText: formattedOriginalText,
        needsReview,
        needsValidation,
        structure,
        possibleStructures: structures,
        valid,
      })

      newNode.content = onlyAttrs ? thisNode.content : fragment

      // eslint-disable-next-line
      for (const [key, value] of Object.entries(attrs)) {
        // check if the value is different from the current value

        if (node.attrs[key] !== value) {
          // console.log('Attr change! Key: ', key, 'Value: ', value)
          newNode.attrs[key] = value
        } else {
          // console.log('Not changing: Key: ', key, 'Value: ', value)
        }
      }

      // console.log('node in setContent:', newNode)

      tr = tr.replaceWith(startPosition, endPosition, newNode)
      activeView.dispatch(tr)
      activeView.focus()
    }
  }

  const makeFragmentFrom = text => {
    const elementFromString = string => {
      const wrappedValue = `<body>${string}</body>`

      return new window.DOMParser().parseFromString(wrappedValue, 'text/html')
        .body
    }

    const parser = DOMParser.fromSchema(pmViews.main.state.config.schema)

    const parsedContent = parser.parse(elementFromString(text))
    // This is coming back as a node. We want it to be a mark
    const myFragment = Fragment.from(parsedContent)
    // We are getting the fragment that's inside <p class="ref">...</p>
    return myFragment.content[0].content.content[0].content
  }

  const sendToAnystyle = async text => {
    const response = await AnyStyleTransformation({
      content: striptags(text),
    })

    const thisResponse = JSON.parse(response)[0]
    // thisResponse is a CSL object with .formattedCitation as the formatted version
    return { anyStyle: thisResponse }
  }

  const sendToCrossRef = async text => {
    const response = await CrossRefTransformation(text)
    return { crossRef: response }
  }

  useEffect(() => {
    // This is where we send things off to Anystyle/Crossref if it needs to be validated
    const getVersions = async () => {
      // console.log('Getting versions from CrossRef and AnyStyle')
      setLoading(true)
      await Promise.all([
        await sendToAnystyle(formattedOriginalText),
        await sendToCrossRef(formattedOriginalText),
      ]).then(data => {
        const newStructures = {
          ...structures,
          ...data[0],
          ...data[1],
        }

        setStructures(newStructures)
        // console.log("Versions found. Setting status to 'needs review'")
        setInternalNeedsValidation(false)
        setInternalNeedsReview(true)
        setContent(
          {
            needsValidation: false,
            needsReview: true,
            valid: false,
            originalText: formattedOriginalText,
            possibleStructures: newStructures,
          },
          null,
          true,
        )
        setLoading(false)
      })
    }

    if (
      needsValidation &&
      !loading &&
      !structures.crossRef.length &&
      !(JSON.stringify(structures.anyStyle).length > 2)
    ) {
      // we shouldn't do this if we already have crossref/anystyle versions
      getVersions()
    }
  }, [formattedOriginalText, internalNeedsValidation])

  useEffect(() => {
    if (
      JSON.stringify(structures) !== JSON.stringify(possibleStructures) &&
      !loading
    ) {
      setContent(
        {
          needsValidation: true,
          needsReview: false,
          valid: false,
          possibleStructures: structures,
        },
        null,
        true,
      )
      setInternalNeedsValidation(true)
      setInternalNeedsReview(false)
    }
  }, [structures])

  useEffect(() => {
    // This is firing whenever we change currentText.
    const newFragment = makeFragmentFrom(currentText)

    // If currentText has changed in some way, we need to save it to the node.
    if (JSON.stringify(newFragment) !== JSON.stringify(node.content)) {
      // console.log('something is changed: ', newFragment, node.content)
      // This should probably not be happening all the time. If you then click CLOSE, it's already been set.
      setContent(
        {
          structure: potentialCsl,
          needsValidation: false,
          needsReview: false,
          valid: true,
        },
        newFragment,
      )
      setInternalNeedsValidation(false)
      setInternalNeedsReview(false)
    }
  }, [currentText])

  const CitationPopUp = () => {
    const areOtherComponentsLoading = () => {
      // console.log('Running areOtherComponentsLoading')

      const activeLoading = DocumentHelpers.findChildrenByType(
        activeView.state.doc,
        activeView.state.schema.nodes.reference,
      ).filter(x => x.node.attrs.needsValidation)

      // console.log('Other loading components: ', activeLoading)

      return activeLoading.length > 0
    }

    const [otherLoading, setOtherLoading] = useState(
      areOtherComponentsLoading(),
    )

    useEffect(() => {
      // This checks if other references are in a loading state.
      if (otherLoading) {
        const timer = setTimeout(() => {
          // console.log('Checking other loading!')
          setOtherLoading(areOtherComponentsLoading())
        }, 1000)

        return () => clearTimeout(timer)
      }

      // console.log('Other loading has been turned off.')
      return undefined
    }, [otherLoading])

    return (
      <PopUpWrapper>
        {editing ? (
          <EditModal
            citationData={
              JSON.stringify(potentialCsl) === '{}' ? structure : potentialCsl
            }
            closeModal={() => {
              setEditing(false)
            }}
            formattedCitation={potentialText}
            setCitationData={currentCitation => {
              const newStructures = { ...structures, custom: currentCitation }
              setStructures(newStructures)

              // Question: is it possible someone clicks "close" before formattedCitation has been generated?

              const newFragment = makeFragmentFrom(
                currentCitation.formattedCitation,
              )

              setContent(
                {
                  structure: currentCitation,
                  possibleStructures: newStructures, // This seems like it's not working.
                  needsValidation: false,
                  needsReview: false,
                  valid: true,
                },
                newFragment,
                false,
              )

              setInternalNeedsValidation(false)
              setInternalNeedsReview(false)
              setPotentialText(currentCitation.formattedCitation) // seeing if this fixes the problem.
              setPotentialCsl(currentCitation)
              setCurrentText(currentCitation.formattedCitation) // is this going to do a double-save?
              // When apply is clicked, we're closing this.

              setIsOpen(false)
            }}
            styleReference={CiteProcTransformation}
          />
        ) : (
          <div>
            <h4>Select citation</h4>

            <CitationVersion
              select={() => {
                setPotentialCsl({})
                setPotentialText(formattedOriginalText)
              }}
              selected={
                decodeEntities(formattedOriginalText) ===
                decodeEntities(potentialText)
              }
              text={formattedOriginalText}
              type="original"
            />
            {structures.anyStyle && (
              <CitationVersion
                select={() => {
                  setPotentialCsl(structures.anyStyle)
                  setPotentialText(structures.anyStyle.formattedCitation)
                }}
                selected={
                  decodeEntities(structures.anyStyle.formattedCitation) ===
                  decodeEntities(potentialText)
                }
                text={structures.anyStyle.formattedCitation}
                type="anystyle"
              />
            )}
            {structures.crossRef
              ? structures.crossRef.map(
                  (crossRefVersion, crossRefId) =>
                    crossRefVersion.formattedCitation && (
                      <CitationVersion
                        key={
                          // eslint-disable-next-line
                          `citationversion-${crossRefId}`
                        }
                        select={() => {
                          setPotentialCsl(crossRefVersion)
                          setPotentialText(crossRefVersion.formattedCitation)
                        }}
                        selected={
                          decodeEntities(crossRefVersion.formattedCitation) ===
                          decodeEntities(potentialText)
                        }
                        text={crossRefVersion.formattedCitation}
                        type="crossref"
                      />
                    ),
                )
              : null}
            {loading ? (
              <div style={{ marginTop: '16px' }}>
                <Spinner />
              </div>
            ) : null}
            {structures.custom ? (
              <CitationVersion
                select={() => {
                  setPotentialCsl(structures.custom)
                  setPotentialText(structures.custom.formattedCitation)
                }}
                selected={
                  decodeEntities(structures.custom.formattedCitation) ===
                  decodeEntities(potentialText)
                }
                text={structures.custom.formattedCitation}
                type="custom"
              />
            ) : null}
            <StatusBar>
              <Button
                disabled={loading || otherLoading} // This is now set to disabled if there are still versions to come in
                onClick={e => {
                  e.preventDefault()
                  setEditing(true)
                }}
                type="button"
              >
                Edit
              </Button>
              <Button
                onClick={e => {
                  e.preventDefault()
                  // this changes the display text. It also kicks off the useEffect
                  setCurrentText(potentialText)
                  // This needs to geive it PotentialText as a fragment
                  const newFragment = makeFragmentFrom(potentialText)
                  // second save does the text
                  setContent(
                    {
                      structure: potentialCsl,
                      valid: true,
                      needsValidation: false,
                      needsReview: false,
                    },
                    newFragment,
                    true,
                  )

                  setInternalNeedsValidation(false)
                  setInternalNeedsReview(false)

                  setIsOpen(false)
                }}
                primary
                type="primary"
              >
                Apply
              </Button>
            </StatusBar>
          </div>
        )}
      </PopUpWrapper>
    )
  }

  return (
    <CitationOuterWrapper>
      <Wrapper
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <CitationWrapper>
          {currentText.length > 19 ? (
            <div // eslint-disable-next-line
              dangerouslySetInnerHTML={{ __html: sanitize(currentText) }}
            />
          ) : (
            // This is a fallback in case we're getting an empty value for citation. Shouldn't happen.
            <span>Edit malformed citation</span>
          )}
        </CitationWrapper>
        <StatusContainer>
          {decideStatus(internalNeedsReview, internalNeedsValidation) ===
            'checked' && (
            <CheckCircle alt="valid" color={color.success.base} title="valid" />
          )}
          {decideStatus(internalNeedsReview, internalNeedsValidation) ===
            'needs validation' && (
            <List
              alt="needs validation"
              color={color.brand1.base()}
              title="needs validation"
            />
          )}
          {decideStatus(internalNeedsReview, internalNeedsValidation) ===
            'needs review' && (
            <AlertCircle
              alt="needs review"
              color={color.warning.base}
              title="needs review"
            />
          )}
        </StatusContainer>
      </Wrapper>
      <Modal
        contentStyles={{
          margin: 'auto',
          width: '800px',
          minHeight: '480px',
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
        isOpen={isOpen}
      >
        <CitationPopUp />
        <CloseButton
          onClick={e => {
            e.preventDefault()
            setIsOpen(false)
          }}
        >
          <CloseButtonIcon />
        </CloseButton>
      </Modal>
    </CitationOuterWrapper>
  )
}

export default CitationComponent
