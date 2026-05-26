export function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    ;[0, 0.22, 0.44].forEach((delay, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      const comp = ctx.createDynamicsCompressor()
      osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination)
      osc.frequency.value = i === 2 ? 1046 : 880
      gain.gain.setValueAtTime(0, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + delay + 0.01)
      gain.gain.setValueAtTime(1.0, ctx.currentTime + delay + 0.18)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.36)
    })
  } catch { /* ignore */ }
}
