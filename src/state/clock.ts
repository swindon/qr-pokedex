import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';

export function useClock(playing: Ref<boolean>, epoch: Ref<number>) {
  const time = ref(0);
  let frame = 0;
  let last = 0;

  function tick(now: number) {
    if (!playing.value) {
      last = 0;
      return;
    }
    if (last) time.value += Math.min(0.05, (now - last) / 1000);
    last = now;
    frame = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(frame);
    last = 0;
    if (playing.value) frame = requestAnimationFrame(tick);
  }

  watch(playing, start);
  watch(epoch, () => {
    time.value = 0;
    start();
  });

  onMounted(start);
  onUnmounted(() => cancelAnimationFrame(frame));

  function seek(next: number) {
    time.value = next;
    last = 0;
  }

  return { time, seek };
}
