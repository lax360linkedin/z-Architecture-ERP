import { useRef, useState } from 'react'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { classNames } from '../../utils/format'
import toast from 'react-hot-toast'

export function FileUpload({ onFiles, multiple = true, accept, hint = 'PDF, DWG, DOCX, XLSX, JPG or PNG up to 25MB' }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState([])

  function handleFiles(list) {
    const arr = Array.from(list)
    setFiles((prev) => [...prev, ...arr])
    onFiles?.(arr)
    toast.success(`${arr.length} file${arr.length > 1 ? 's' : ''} added`)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
        }}
        className={classNames(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-border hover:border-brand-300 hover:bg-surface-subtle'
        )}
      >
        <UploadCloud className="h-6 w-6 text-ink-faint" />
        <p className="text-sm font-medium text-ink">Click to upload or drag and drop</p>
        <p className="text-xs text-ink-faint">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate">
                <FileIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-xs text-ink-faint">{(f.size / 1024).toFixed(0)} KB</span>
              </span>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="rounded p-1 text-ink-faint hover:bg-surface-subtle hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
