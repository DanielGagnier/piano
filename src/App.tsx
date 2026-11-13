import './App.css'
import { useState, useRef, useEffect } from 'react'
import { AudioEngine } from './audio/AudioEngine'

function App() {
  const octaves = [3, 4, 5]

  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#']

  const whiteKeys = octaves.flatMap((octave) =>
    whiteNotes.map((note) => `${note}${octave}`)
  )

  const blackKeys = octaves.flatMap((octave) =>
    blackNotes.map((note) => `${note}${octave}`)
  )

  const keyMap: Record<string, string> = {
    a: 'C',
    w: 'C#',
    s: 'D',
    e: 'D#',
    d: 'E',
    f: 'F',
    t: 'F#',
    g: 'G',
    y: 'G#',
    h: 'A',
    u: 'A#',
    j: 'B'
  }

  const [activeNotes, setActiveNotes] = useState<string[]>([])
  const [selectedOctave, setSelectedOctave] = useState(4)
  const [instrument, setInstrument] = useState<'acoustic' | 'electric'>('acoustic')

  const audioEngine = useRef(new AudioEngine())

  async function playNote(note: string) {
    setActiveNotes((previousNotes) =>
      previousNotes.includes(note)
        ? previousNotes
        : [...previousNotes, note]
    )

    if (instrument === 'acoustic') {
      await audioEngine.current.playNote(note)
    } else {
      await audioEngine.current.playElectricNote(note)
    }
  }

  function stopNote(note: string) {
    if (instrument === 'acoustic') {
      audioEngine.current.stopNote(note)
    } else {
      audioEngine.current.stopElectricNote(note)
    }

    setActiveNotes((previousNotes) =>
      previousNotes.filter((activeNote) => activeNote !== note)
    )
  }

    useEffect(() => {
      function handleKeyDown(event: KeyboardEvent) {
        const note = keyMap[event.key.toLowerCase()]

        if (!note || event.repeat) return

        playNote(`${note}${selectedOctave}`)
      }

      function handleKeyUp(event: KeyboardEvent) {
        const note = keyMap[event.key.toLowerCase()]

        if (!note) return

        stopNote(`${note}${selectedOctave}`)
      }

      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
      }
    }, [selectedOctave, instrument])

  return (
    <div className="app">
      <h1>Virtual Piano</h1>
      <div className="instrument-selector">
        <button
          className={instrument === 'acoustic' ? 'selected' : ''}
          onClick={() => setInstrument('acoustic')}
        >
          Acoustic Piano
        </button>

        <button
          className={instrument === 'electric' ? 'selected' : ''}
          onClick={() => setInstrument('electric')}
        >
          Electric Piano
        </button>
      </div>

      <div className="octave-selector">
        <span>Keyboard Octave:</span>

        {octaves.map((octave) => (
          <button
            key={octave}
            className={selectedOctave === octave ? 'selected' : ''}
            onClick={() => setSelectedOctave(octave)}
          >
            {octave}
          </button>
        ))}
      </div>

      <div className="piano">
        <div className="white-keys">
          {whiteKeys.map((note) => (
            <button
              key={note}
              className={`white-key ${activeNotes.includes(note) ? 'active' : ''}`}
              onMouseDown={() => playNote(note)}
              onMouseUp={() => stopNote(note)}
              onMouseLeave={() => stopNote(note)}
            >
              {note.slice(0, -1)}
            </button>
          ))}
        </div>

        {blackKeys.map((note, index) => {
          const octaveIndex = Math.floor(index / 5)
          const keyIndex = index % 5

          const positions = [1, 2, 4, 5, 6]

          const whiteKeyIndex = octaveIndex * 7 + positions[keyIndex]

          return (
            <button
              key={note}
              className={`black-key ${activeNotes.includes(note) ? 'active' : ''}`}
              style={{
                left: `${(whiteKeyIndex / whiteKeys.length) * 100}%`
              }}
              onMouseDown={() => playNote(note)}
              onMouseUp={() => stopNote(note)}
              onMouseLeave={() => stopNote(note)}
            >
              {note.slice(0, -1)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default App