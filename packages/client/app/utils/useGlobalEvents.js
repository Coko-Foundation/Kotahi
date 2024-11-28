import { isFunction } from 'lodash'
import { onEntries } from '../components/component-ai-assistant/utils/utils'
import GlobalState from './GlobalState'

const { useEffect } = require('react')

/**
 * Custom hook to handle event listener addition for GlobalState.
 * @param {string} instanceName - The name of the GlobalState instance.
 * @param {Object} listeners - A dictionary where keys are event names and values are listener functions.
 */
const useGlobalEvents = (instanceName, listeners = {}) => {
  const instance = GlobalState.get(instanceName)

  useEffect(() => {
    onEntries(listeners, (name, cb) => {
      isFunction(cb) && instance.on(name, cb)
    })

    return () => {
      onEntries(listeners, (name, listener) => {
        isFunction(listener) && instance.off(name, listener)
      })
    }
  }, [instance, listeners])
}

export default useGlobalEvents
