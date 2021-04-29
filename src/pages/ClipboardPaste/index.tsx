import { useEffect } from 'react'

export default function ClipboardPaste() {
  const handlePaste = (event) => {
    var items = (event.clipboardData && event.clipboardData.items) || []
    console.log(items)
    var file = null

    if (items && items.length) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile()
          break
        }
      }
    }
    console.log(' file ', file)
  }

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [])

  return <> 123 </>
}
