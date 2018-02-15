import styled from 'styled-components'

// TODO: use the parent validots node instead of document
// TODO: highlight the scrolled-to element
const scrollIntoView = id => document.getElementById(id).scrollIntoView()

const Validot = styled.div.attrs({
  onClick: props => () => scrollIntoView(props.input.name),
})`
  background: var(--color-circle);
  border: 3px solid white;
  border-radius: 100%;
  cursor: pointer;
  display: block;
  height: 25px;
  margin: 5px 10px;
  position: relative;
  width: 25px;


  &:hover::before {
    background: var(--color-circle);
    border-radius: 50%;
    content: ' ';
    height: 25px;
    position: absolute;
    transform: scale(1.5);
    transform-origin: 50%;
    width: 25px;
    z-index: -1;
  }

  &:hover::after {
    color: var(--color-circle);
    content: '${props => props.message}';
    display: block;
    font-size: 0.8em;
    font-style: italic;
    margin-left: 3em;
    margin-top: -0.5em;
    width: 20ch;
  }

  --color-circle: var(${props => {
    if (props.valid) return '--color-primary'
    if (props.warning) return '--color-warning'
    if (props.error) return '--color-error'
    return '--color-furniture'
  }});
`

export default Validot
