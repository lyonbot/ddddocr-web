import { initPromise, recognize } from "./ddddocr"
import './index.scss'

const loadingMask = document.getElementById('loadingMask') as HTMLDivElement
const fileAccepter = document.getElementById('fileAccepter') as HTMLDivElement
const fileInput = document.getElementById('fileInput') as HTMLInputElement
const outputInput = document.getElementById('output') as HTMLInputElement
const inputPreview = document.getElementById('inputPreview') as HTMLImageElement

document.getElementById('loadExample')!.onclick = () => {
  fetch('./input.jpg').then(res => res.blob()).then(setFile)
}

document.addEventListener('paste', e => {
  const items = e.clipboardData?.items
  if (!items?.length) return

  setFile(items[0]?.getAsFile())
  e.preventDefault()
})

fileInput.addEventListener('change', e => {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return

  setFile(files[0])
})

initPromise.then(
  () => loadingMask.remove(),
)

function setFile(file: Blob | null | undefined) {
  if (!file || !file.type.startsWith('image/')) return

  const path = URL.createObjectURL(file)
  inputPreview.src = path
  outputInput.value = 'Please Wait...'

  recognize(file).then(result => {
    outputInput.value = result.answer
    outputInput.select()
    outputInput.focus()
  })
}