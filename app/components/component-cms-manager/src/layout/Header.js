import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { DragVerticalIcon } from '../../../shared/Icons'
import {
  LayoutHeaderListContainer,
  LayoutHeaderListItem,
  LayoutMainHeading,
  LayoutSecondaryHeading,
} from '../style'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  const reorderedItems = result.map((item, index) => {
    item.sequenceIndex = index + 1 // eslint-disable-line no-param-reassign
    return item
  })

  return reorderedItems
}

const reformObject = values => {
  return values.map(item => ({
    id: item.id,
    title: item.title,
    sequenceIndex: item.sequenceIndex,
    menu: item.menu,
  }))
}

const Header = ({ initialItems, onItemUpdated }) => {
  const [items, setItems] = React.useState(reformObject(initialItems))

  const updateItems = updatedItems => {
    setItems(updatedItems)
    onItemUpdated(updatedItems)
  }

  const onDragEnd = result => {
    if (!result.destination) {
      return
    }

    const updatedItems = reorder(
      items,
      result.source.index,
      result.destination.index,
    )

    updateItems(updatedItems)
  }

  const toggleChange = (item, index) => {
    const updatedItems = Array.from(items)
    updatedItems[index].menu = !item.menu
    updateItems(updatedItems)
  }

  const renderItemList = (item, index) => {
    return (
      <Draggable draggableId={item.id} index={index} key={item.id}>
        {(provided, snapshot) => (
          <LayoutHeaderListItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div>
              <input
                checked={item.menu}
                name={item.id}
                onChange={() => toggleChange(item, index)}
                style={{ margin: '10px' }}
                type="checkbox"
                value={item.id}
              />
              {item.title}
            </div>
            <DragVerticalIcon />
          </LayoutHeaderListItem>
        )}
      </Draggable>
    )
  }

  return (
    <div>
      <LayoutMainHeading>
        Header
        <LayoutSecondaryHeading>
          Use checkbox to show and hide the page in the menu. Click and Drag to
          order them.
        </LayoutSecondaryHeading>
      </LayoutMainHeading>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <LayoutHeaderListContainer
              {...provided.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
              ref={provided.innerRef}
            >
              {items.map((item, index) => renderItemList(item, index))}
              {provided.placeholder}
            </LayoutHeaderListContainer>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default Header
