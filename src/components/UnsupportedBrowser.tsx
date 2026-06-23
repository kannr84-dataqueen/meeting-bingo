export default function UnsupportedBrowser() {
  return (
    <div
      role="note"
      className="mx-4 mb-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
    >
      <p className="text-sm" style={{ color: '#374151' }}>
        <span className="font-medium">Manual mode</span> — Automatic detection isn't available in
        this browser. Tap squares when you hear a buzzword. Chrome or Edge recommended for the full
        experience.
      </p>
    </div>
  )
}
