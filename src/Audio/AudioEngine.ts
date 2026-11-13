import * as Tone from 'tone'
import { ElectricPiano } from 'smplr'

export class AudioEngine {
  private sampler: Tone.Sampler
  private electricPiano: ReturnType<typeof ElectricPiano>
  private loaded: Promise<void>
  private heldNotes = new Set<string>()
  private isLoaded = false

  constructor() {
    this.sampler = new Tone.Sampler({
      urls: {
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    }).toDestination()

    this.electricPiano = ElectricPiano(Tone.getContext().rawContext, {
      instrument: 'WurlitzerEP200',
    })

    this.loaded = Tone.loaded()
      .then(() => {
        this.isLoaded = true
        console.log('Piano samples loaded successfully')
      })
      .catch((error) => {
        console.error('Failed to load piano samples:', error)
        throw error
      })
  }

  async playNote(note: string) {
    this.heldNotes.add(note)

    await Tone.start()
    await this.loaded

    if (this.heldNotes.has(note)) {
      this.sampler.triggerAttack(note)
    }
  }

  stopNote(note: string) {
    this.heldNotes.delete(note)

    if (this.isLoaded) {
      this.sampler.triggerRelease(note)
    }
  }

  async playElectricNote(note: string) {
    await Tone.start()
    await this.electricPiano.ready
    this.electricPiano.start({ note })
  }

  stopElectricNote(note: string) {
    this.electricPiano.stop(note)
  }
}
