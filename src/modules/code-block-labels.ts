import { type UserModule } from '~/types'

export const install: UserModule = ({ router }) => {
  if (typeof window === 'undefined') return

  // Extract language from class name and set data-language attribute
  const setCodeBlockLabels = () => {
    const codeBlocks = document.querySelectorAll('.prose pre[class*="language-"]')

    codeBlocks.forEach((pre) => {
      // Skip if already processed
      if (pre.hasAttribute('data-language')) return

      const classList = Array.from(pre.classList)
      const languageClass = classList.find(cls => cls.startsWith('language-'))

      if (languageClass) {
        const language = languageClass.replace('language-', '').trim()
        if (language) {
          pre.setAttribute('data-language', language)
        }
      }
    })
  }

  // Debounce function to avoid excessive calls
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const debouncedSetLabels = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(setCodeBlockLabels, 50)
  }

  // Run on route changes
  router.afterEach(() => {
    setTimeout(setCodeBlockLabels, 100)
  })

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setCodeBlockLabels)
  } else {
    setCodeBlockLabels()
  }

  // Use MutationObserver to handle dynamically added code blocks
  const observer = new MutationObserver((mutations) => {
    // Only process if code blocks are added
    const hasCodeBlocks = mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(node =>
        node.nodeType === 1 && (
          (node as Element).querySelector?.('.prose pre[class*="language-"]') ||
          (node as Element).matches?.('.prose pre[class*="language-"]')
        )
      )
    )
    if (hasCodeBlocks) {
      debouncedSetLabels()
    }
  })

  // Observe the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

