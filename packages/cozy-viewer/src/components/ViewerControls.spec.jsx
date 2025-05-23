import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

import ViewerByFile from './ViewerByFile'
import ViewerControls from './ViewerControls'
import DemoProvider from '../providers/DemoProvider'

jest.mock('../ViewersByFile/AudioViewer', () => () => <div>AudioViewer</div>)
jest.mock('cozy-ui/transpiled/react/providers/Encrypted', () => ({
  useEncrypted: () => ({ url: 'random' })
}))

describe('ViewerControls', () => {
  const file = {
    _id: 'audio',
    class: 'audio',
    mime: 'audio/mp3',
    name: 'sample.mp3'
  }

  const setup = ({ children } = {}) => {
    render(
      <DemoProvider withContainer file={file}>
        <ViewerControls
          onClose={() => {}}
          hasPrevious={false}
          hasNext={false}
          onPrevious={() => {}}
          onNext={() => {}}
          toolbarProps={{
            showToolbar: false,
            showClose: false,
            showFilePath: false,
            toolbarRef: undefined
          }}
          showNavigation={false}
        >
          {children}
        </ViewerControls>
      </DemoProvider>
    )
  }

  it('should only render children if they are ViewerByFile', () => {
    setup({
      children: [
        undefined,
        <div key="notViewer">not ViewerByFile</div>,
        <ViewerByFile key="viewer" file={file} onClose={() => {}} />
      ]
    })

    expect(screen.queryByText('not ViewerByFile')).not.toBeInTheDocument()
    expect(screen.getByText('AudioViewer')).toBeInTheDocument()
  })
})
