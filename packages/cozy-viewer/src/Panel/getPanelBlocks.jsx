import { isFromKonnector } from 'cozy-client/dist/models/file'
import KonnectorBlock from 'cozy-harvest-lib/dist/components/KonnectorBlock'

import Informations from './Informations'
import Qualification from './Qualification'
import Sharing from './Sharing'
import Summary from './Summary'

/**
 * @typedef {Object} PanelBlockSpec
 * @property {Function} condition - Function that returns true if the block should be displayed
 * @property {React.Component} component - Component to display
 */

/**
 * @typedef {Object.<string, PanelBlockSpec>} PanelBlocksSpecs
 */

/**
 * Returns the specs of the blocks to display in the panel
 * @param {boolean} isPublic - Whether the panel is displayed in public view
 * @returns {PanelBlocksSpecs}
 */
export const getPanelBlocksSpecs = (isPublic = false, panelProps) => ({
  qualifications: {
    condition: () => !panelProps?.qualifications?.disabled,
    component: Qualification
  },
  summary: {
    condition: () => !panelProps?.summary?.disabled,
    component: Summary
  },
  konnector: {
    condition: file =>
      !panelProps?.konnector?.disabled && isFromKonnector(file) && !isPublic,
    component: KonnectorBlock
  },
  informations: {
    condition: () => !panelProps?.informations?.disabled,
    component: Informations
  },
  sharing: {
    condition: () => !panelProps?.sharing?.disabled && !isPublic,
    component: Sharing
  }
})

/**
 * Returns the blocks to display in the panel
 * @param {Object} options
 * @param {PanelBlocksSpecs} options.panelBlocksSpecs - Specs of the blocks to display in the panel
 * @param {import('cozy-client/types/types').FileDocument} options.file - File object
 * @returns {Array.<React.Component>}
 */
const getPanelBlocks = ({ panelBlocksSpecs, file }) => {
  const panelBlocks = []

  Object.values(panelBlocksSpecs).forEach(panelBlock => {
    panelBlock.condition(file) && panelBlocks.push(panelBlock.component)
  })

  return panelBlocks
}

export default getPanelBlocks
