import { defineDocs } from '@erikt/docgen'

export default defineDocs({
  siteName: 'Ajax',
  structure: [
    { label: 'Getting started', path: '/getting-started', icon: 'book' },
    { label: 'API', path: '/api', icon: 'settings-2' },
    { label: 'Plugins', path: '/plugins', icon: 'plug' },
    { label: 'Changelog', path: '/changelog', icon: 'list-tree' },
  ],
})
